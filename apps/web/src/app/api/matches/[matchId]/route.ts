import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        entries: {
          include: { agent: true },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: match.id,
      status: match.status,
      entryFee: match.entryFee,
      winnerId: match.winnerId,
      totalTicks: match.totalTicks,
      agents: match.entries.map((e) => ({
        id: e.agent.id,
        tokenId: e.agent.tokenId,
        name: e.agent.name,
        archetype: e.agent.archetype,
        stats: {
          strength: e.agent.strength,
          agility: e.agent.agility,
          resilience: e.agent.resilience,
          intelligence: e.agent.intelligence,
        },
        placement: e.placement,
      })),
      createdAt: match.createdAt.toISOString(),
      startedAt: match.startedAt?.toISOString() ?? null,
      completedAt: match.completedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error(`GET /api/matches/${params.matchId} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch match" },
      { status: 500 }
    );
  }
}
