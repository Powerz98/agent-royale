import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MAX_AGENTS_PER_MATCH } from "@agent-royale/shared";

export async function POST(
  request: Request,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const { agentId } = await request.json();

    if (!agentId) {
      return NextResponse.json(
        { error: "Missing agentId" },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { entries: true },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "waiting") {
      return NextResponse.json(
        { error: "Match is not accepting entries" },
        { status: 400 }
      );
    }

    if (match.entries.length >= MAX_AGENTS_PER_MATCH) {
      return NextResponse.json({ error: "Match is full" }, { status: 400 });
    }

    const alreadyEntered = match.entries.some((e) => e.agentId === agentId);
    if (alreadyEntered) {
      return NextResponse.json(
        { error: "Agent already in this match" },
        { status: 400 }
      );
    }

    const entry = await prisma.matchEntry.create({
      data: { matchId, agentId },
    });

    const updatedMatch = await prisma.match.findUnique({
      where: { id: matchId },
      include: { entries: true },
    });

    const isFull = updatedMatch!.entries.length >= MAX_AGENTS_PER_MATCH;

    return NextResponse.json({
      entryId: entry.id,
      agentCount: updatedMatch!.entries.length,
      isFull,
    });
  } catch (error) {
    console.error(`POST /api/matches/${params.matchId}/enter error:`, error);
    return NextResponse.json(
      { error: "Failed to enter match" },
      { status: 500 }
    );
  }
}
