import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        entries: {
          include: { agent: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = matches.map((match) => ({
      id: match.id,
      status: match.status,
      entryFee: match.entryFee,
      agents: match.entries.map((e) => ({
        id: e.agent.id,
        name: e.agent.name,
        archetype: e.agent.archetype,
      })),
      winner: match.winnerId
        ? match.entries.find((e) => e.agentId === match.winnerId)?.agent ?? null
        : null,
      createdAt: match.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/matches error:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Require SIWE authentication to create a match
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const match = await prisma.match.create({
      data: {},
    });

    return NextResponse.json(
      { id: match.id, status: match.status },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/matches error:", error);
    return NextResponse.json(
      { error: "Failed to create match" },
      { status: 500 }
    );
  }
}
