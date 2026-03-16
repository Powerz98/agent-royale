import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const ARCHETYPE_NAMES: Record<number, string> = {
  0: "Brawler",
  1: "Tactician",
  2: "Survivor",
};

const ARCHETYPE_COLORS: Record<number, string> = {
  0: "#e53e3e", // red
  1: "#3182ce", // blue
  2: "#38a169", // green
};

function generateSvg(
  name: string,
  archetype: number,
  stats: { strength: number; agility: number; resilience: number; intelligence: number }
): string {
  const color = ARCHETYPE_COLORS[archetype] ?? "#888";
  const archetypeName = ARCHETYPE_NAMES[archetype] ?? "Unknown";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect width="400" height="400" fill="#0f0f0f"/>
  <rect x="20" y="20" width="360" height="360" rx="16" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="2"/>
  <text x="200" y="70" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="${color}">${escapeXml(name)}</text>
  <text x="200" y="100" text-anchor="middle" font-family="monospace" font-size="14" fill="#aaa">${archetypeName}</text>
  <line x1="60" y1="120" x2="340" y2="120" stroke="${color}" opacity="0.4"/>
  <text x="80" y="170" font-family="monospace" font-size="16" fill="#fff">STR  ${stats.strength}</text>
  <text x="80" y="200" font-family="monospace" font-size="16" fill="#fff">AGI  ${stats.agility}</text>
  <text x="80" y="230" font-family="monospace" font-size="16" fill="#fff">RES  ${stats.resilience}</text>
  <text x="80" y="260" font-family="monospace" font-size="16" fill="#fff">INT  ${stats.intelligence}</text>
  ${statBar(240, 160, stats.strength, color)}
  ${statBar(240, 190, stats.agility, color)}
  ${statBar(240, 220, stats.resilience, color)}
  ${statBar(240, 250, stats.intelligence, color)}
  <text x="200" y="340" text-anchor="middle" font-family="monospace" font-size="12" fill="#666">AGENT ROYALE</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function statBar(x: number, y: number, value: number, color: string): string {
  const maxWidth = 80;
  const width = Math.min(Math.max((value / 100) * maxWidth, 4), maxWidth);
  return `<rect x="${x}" y="${y - 10}" width="${maxWidth}" height="12" rx="3" fill="#333"/>
  <rect x="${x}" y="${y - 10}" width="${width}" height="12" rx="3" fill="${color}"/>`;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenId = parseInt(params.tokenId, 10);

  if (isNaN(tokenId) || tokenId < 0) {
    return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
  }

  const agent = await prisma.agent.findUnique({ where: { tokenId } });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const archetypeName = ARCHETYPE_NAMES[agent.archetype] ?? "Unknown";
  const image = generateSvg(agent.name, agent.archetype, {
    strength: agent.strength,
    agility: agent.agility,
    resilience: agent.resilience,
    intelligence: agent.intelligence,
  });

  const metadata = {
    name: agent.name,
    description: `${agent.name} is a ${archetypeName} class fighter in Agent Royale. ${agent.wins}W-${agent.losses}L | Elo ${agent.elo}`,
    image,
    attributes: [
      { trait_type: "Archetype", value: archetypeName },
      { trait_type: "Strength", value: agent.strength, display_type: "number" },
      { trait_type: "Agility", value: agent.agility, display_type: "number" },
      { trait_type: "Resilience", value: agent.resilience, display_type: "number" },
      { trait_type: "Intelligence", value: agent.intelligence, display_type: "number" },
      { trait_type: "Wins", value: agent.wins, display_type: "number" },
      { trait_type: "Losses", value: agent.losses, display_type: "number" },
      { trait_type: "Elo", value: agent.elo, display_type: "number" },
    ],
  };

  return NextResponse.json(metadata, {
    headers: { "Cache-Control": "public, max-age=60, s-maxage=60" },
  });
}
