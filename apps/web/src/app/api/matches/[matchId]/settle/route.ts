import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateEloChanges } from "@/lib/elo";
import { requireAuth } from "@/lib/auth";

const ENGINE_URL = process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:3001";

export async function POST(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    // Require SIWE authentication
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const { matchId } = params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        entries: { include: { agent: true } },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "InProgress") {
      return NextResponse.json(
        { error: "Match is not in progress" },
        { status: 400 }
      );
    }

    // Get result from engine
    const resultRes = await fetch(`${ENGINE_URL}/matches/${matchId}/result`);

    if (resultRes.status === 202) {
      return NextResponse.json(
        { error: "Match still in progress" },
        { status: 202 }
      );
    }

    if (!resultRes.ok) {
      return NextResponse.json(
        { error: "Failed to get match result from engine" },
        { status: 502 }
      );
    }

    const result = await resultRes.json();

    // Update match and agent records
    await prisma.$transaction(async (tx) => {
      // Update match
      await tx.match.update({
        where: { id: matchId },
        data: {
          status: "Completed",
          winnerId: result.winner,
          totalTicks: result.totalTicks,
          completedAt: new Date(),
        },
      });

      // Update placements
      for (let i = 0; i < result.placements.length; i++) {
        const agentId = result.placements[i];
        await tx.matchEntry.updateMany({
          where: { matchId, agentId },
          data: { placement: i + 1 },
        });
      }

      // Update winner stats
      if (result.winner) {
        await tx.agent.update({
          where: { id: result.winner },
          data: { wins: { increment: 1 } },
        });
      }

      // Update loser stats
      const losers = result.placements.filter(
        (id: string) => id !== result.winner
      );
      for (const loserId of losers) {
        await tx.agent.update({
          where: { id: loserId },
          data: { losses: { increment: 1 } },
        });
      }

      // Update Elo ratings
      const currentRatings: Record<string, number> = {};
      for (const entry of match.entries) {
        currentRatings[entry.agentId] = entry.agent.elo;
      }
      const newRatings = calculateEloChanges(result.placements, currentRatings);
      for (const [agentId, elo] of Object.entries(newRatings)) {
        await tx.agent.update({
          where: { id: agentId },
          data: { elo },
        });
      }
    });

    return NextResponse.json({
      status: "settled",
      winner: result.winner,
      totalTicks: result.totalTicks,
      placements: result.placements,
    });
  } catch (error) {
    console.error(`POST /api/matches/${params.matchId}/settle error:`, error);
    return NextResponse.json(
      { error: "Failed to settle match" },
      { status: 500 }
    );
  }
}
