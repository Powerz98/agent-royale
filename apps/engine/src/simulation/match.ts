import {
  MAX_TICKS,
  STARTING_ENERGY,
  ZONE_SHRINK_INTERVAL,
  GRID_SIZE,
} from "@agent-royale/shared";
import type {
  AgentState,
  AgentStats,
  Archetype,
  MatchResult,
  TickEvent,
} from "@agent-royale/shared";
import { SeededRandom } from "./agent-ai.js";
import { createInitialZone, shrinkZone } from "./zone.js";
import { processTick } from "./tick.js";

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

export function runMatch(
  matchId: string,
  agents: Array<{ id: string; archetype: Archetype; stats: AgentStats }>,
  seed: string,
): MatchResult {
  const rng = new SeededRandom(hashSeed(seed));

  // Initialize agent states with random positions
  const usedPositions = new Set<string>();
  const agentStates: AgentState[] = agents.map((agent) => {
    let pos: { x: number; y: number };
    do {
      pos = {
        x: rng.nextInt(0, GRID_SIZE - 1),
        y: rng.nextInt(0, GRID_SIZE - 1),
      };
    } while (usedPositions.has(`${pos.x}:${pos.y}`));
    usedPositions.add(`${pos.x}:${pos.y}`);

    const maxHp = 50 + agent.stats.resilience * 10;
    return {
      agentId: agent.id,
      position: pos,
      hp: maxHp,
      maxHp,
      energy: STARTING_ENERGY,
      isAlive: true,
      isDefending: false,
      statusEffects: [],
    };
  });

  // Build agent data map
  const agentData = new Map<
    string,
    { archetype: Archetype; stats: AgentStats }
  >();
  for (const agent of agents) {
    agentData.set(agent.id, {
      archetype: agent.archetype,
      stats: agent.stats,
    });
  }

  let zone = createInitialZone();
  const events: TickEvent[] = [];
  let currentStates = agentStates;
  const placements: string[] = [];
  const traps = new Map<string, { damage: number; owner: string }>();

  for (let tick = 1; tick <= MAX_TICKS; tick++) {
    // Shrink zone every ZONE_SHRINK_INTERVAL ticks
    if (tick % ZONE_SHRINK_INTERVAL === 0) {
      zone = shrinkZone(zone);
    }

    const event = processTick(tick, currentStates, agentData, zone, rng, traps);
    events.push(event);
    currentStates = event.agentStates;

    // Track eliminations for placements (eliminated first = placed last)
    for (const eliminatedId of event.eliminations) {
      if (!placements.includes(eliminatedId)) {
        placements.unshift(eliminatedId);
      }
    }

    // Check if only 1 agent alive
    const alive = currentStates.filter((a) => a.isAlive);
    if (alive.length <= 1) {
      if (alive.length === 1) {
        placements.unshift(alive[0].agentId);
      }
      return {
        matchId,
        winner: alive.length === 1 ? alive[0].agentId : placements[0] ?? "",
        placements,
        totalTicks: tick,
        events,
      };
    }
  }

  // If multiple alive at end, winner = highest HP
  const alive = currentStates
    .filter((a) => a.isAlive)
    .sort((a, b) => b.hp - a.hp);

  // Add surviving agents to placements in HP order
  for (let i = alive.length - 1; i >= 0; i--) {
    if (!placements.includes(alive[i].agentId)) {
      placements.unshift(alive[i].agentId);
    }
  }

  return {
    matchId,
    winner: alive[0].agentId,
    placements,
    totalTicks: MAX_TICKS,
    events,
  };
}
