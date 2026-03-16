import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");

    if (!owner) {
      return NextResponse.json(
        { error: "Missing owner query parameter" },
        { status: 400 }
      );
    }

    const agents = await prisma.agent.findMany({
      where: { owner: owner.toLowerCase() },
      include: {
        matchEntries: {
          include: { match: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = agents.map((agent) => ({
      id: agent.id,
      tokenId: agent.tokenId,
      name: agent.name,
      archetype: agent.archetype,
      stats: {
        strength: agent.strength,
        agility: agent.agility,
        resilience: agent.resilience,
        intelligence: agent.intelligence,
      },
      wins: agent.wins,
      losses: agent.losses,
      elo: agent.elo,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Require SIWE authentication
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;
    const walletAddress = auth.toLowerCase();

    const body = await request.json();
    const { tokenId, name, archetype, strength, agility, resilience, intelligence, owner } = body;

    if (!tokenId || !name || archetype === undefined || !owner) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify the caller owns the wallet they claim to be registering for
    if (owner.toLowerCase() !== walletAddress) {
      return NextResponse.json(
        { error: "Cannot register an agent for a different wallet" },
        { status: 403 }
      );
    }

    // Check if agent already registered
    const existing = await prisma.agent.findUnique({
      where: { tokenId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Agent already registered", agent: existing },
        { status: 409 }
      );
    }

    const agent = await prisma.agent.create({
      data: {
        tokenId,
        name,
        archetype,
        strength: strength ?? 5,
        agility: agility ?? 5,
        resilience: resilience ?? 5,
        intelligence: intelligence ?? 5,
        owner: walletAddress,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("POST /api/agents error:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}
