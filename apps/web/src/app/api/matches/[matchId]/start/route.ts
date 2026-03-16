import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
        entries: {
          include: { agent: true },
        },
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status !== "waiting") {
      return NextResponse.json(
        { error: "Match already started or completed" },
        { status: 400 }
      );
    }

    if (match.entries.length < 2) {
      return NextResponse.json(
        { error: "Need at least 2 agents to start" },
        { status: 400 }
      );
    }

    // Build agent data for engine
    const agents = match.entries.map((e) => ({
      id: e.agent.id,
      archetype: e.agent.archetype,
      stats: {
        strength: e.agent.strength,
        agility: e.agent.agility,
        resilience: e.agent.resilience,
        intelligence: e.agent.intelligence,
      },
    }));

    const seed = `${matchId}-${Date.now()}`;

    // Call engine to start the match
    const engineRes = await fetch(`${ENGINE_URL}/matches/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, agents, seed }),
    });

    if (!engineRes.ok) {
      const err = await engineRes.json();
      return NextResponse.json(
        { error: "Engine failed to start match", details: err },
        { status: 502 }
      );
    }

    // Update match status
    await prisma.match.update({
      where: { id: matchId },
      data: {
        status: "InProgress",
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ status: "started", matchId });
  } catch (error) {
    console.error(`POST /api/matches/${params.matchId}/start error:`, error);
    return NextResponse.json(
      { error: "Failed to start match" },
      { status: 500 }
    );
  }
}
