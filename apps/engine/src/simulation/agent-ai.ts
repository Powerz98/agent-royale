import {
  ActionType,
  Archetype,
  MOVE_COST,
  ATTACK_COST,
  DEFEND_COST,
  SPECIAL_COST,
} from "@agent-royale/shared";
import type { AgentState, AgentStats, Position } from "@agent-royale/shared";
import { getAdjacentPositions, manhattanDistance, GRID_SIZE } from "./grid.js";
import { isInZone, type ZoneState } from "./zone.js";

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    // LCG parameters (Numerical Recipes)
    this.state = (this.state * 1664525 + 1013904223) & 0x7fffffff;
    return this.state / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
}

export function scoreAction(
  agent: AgentState,
  action: ActionType,
  target: Position | null,
  archetype: Archetype,
  stats: AgentStats,
  allAgents: AgentState[],
  zone: ZoneState,
  rng: SeededRandom,
): number {
  let score = 0;

  // Archetype base weights
  switch (archetype) {
    case Archetype.Brawler:
      if (action === ActionType.Attack) score += 0.3;
      if (action === ActionType.Move) score += 0.15;
      if (action === ActionType.Defend) score += 0.05;
      if (action === ActionType.Special) score += 0.2;
      break;
    case Archetype.Tactician:
      if (action === ActionType.Defend) score += 0.2;
      if (action === ActionType.Special) score += 0.3;
      if (action === ActionType.Attack) score += 0.15;
      if (action === ActionType.Move) score += 0.1;
      break;
    case Archetype.Survivor:
      if (action === ActionType.Defend) score += 0.3;
      if (action === ActionType.Charge) score += 0.2;
      if (action === ActionType.Move) score += 0.1;
      if (agent.hp < agent.maxHp * 0.5 && action === ActionType.Special)
        score += 0.4;
      break;
  }

  // Situational modifiers
  const hpPercent = agent.hp / agent.maxHp;
  const aliveAgents = allAgents.filter((a) => a.isAlive && a.agentId !== agent.agentId);

  // Low HP: boost Defend and Charge
  if (hpPercent < 0.3) {
    if (action === ActionType.Defend) score += 0.3;
    if (action === ActionType.Charge) score += 0.2;
  }

  // Low energy: boost Charge
  if (agent.energy < 20) {
    if (action === ActionType.Charge) score += 0.5;
  }

  // Enemy adjacent: boost Attack
  const hasAdjacentEnemy = aliveAgents.some(
    (a) => manhattanDistance(agent.position, a.position) <= 1,
  );
  if (hasAdjacentEnemy && action === ActionType.Attack) {
    score += 0.25;
  }

  // Outside zone: boost Move toward center
  if (!isInZone(agent.position, zone) && action === ActionType.Move) {
    if (target) {
      const centerX = (zone.min.x + zone.max.x) / 2;
      const centerY = (zone.min.y + zone.max.y) / 2;
      const currentDist = Math.abs(agent.position.x - centerX) + Math.abs(agent.position.y - centerY);
      const targetDist = Math.abs(target.x - centerX) + Math.abs(target.y - centerY);
      if (targetDist < currentDist) {
        score += 0.5;
      }
    }
  }

  // Few agents alive: boost Attack (aggression)
  if (aliveAgents.length <= 3 && action === ActionType.Attack) {
    score += 0.2;
  }

  // Intelligence reduces noise
  const noise = rng.next() * (1 - stats.intelligence / 12);
  return score + noise;
}

function getEnergyCost(action: ActionType): number {
  switch (action) {
    case ActionType.Move:
      return MOVE_COST;
    case ActionType.Attack:
      return ATTACK_COST;
    case ActionType.Defend:
      return DEFEND_COST;
    case ActionType.Charge:
      return 0;
    case ActionType.Special:
      return SPECIAL_COST;
  }
}

export function decideAction(
  agent: AgentState,
  archetype: Archetype,
  stats: AgentStats,
  allAgents: AgentState[],
  zone: ZoneState,
  rng: SeededRandom,
): { action: ActionType; target: Position | null } {
  const candidates: Array<{
    action: ActionType;
    target: Position | null;
    score: number;
  }> = [];

  const aliveEnemies = allAgents.filter(
    (a) => a.isAlive && a.agentId !== agent.agentId,
  );

  // Move candidates - adjacent positions
  const adjacentPositions = getAdjacentPositions(agent.position);
  for (const pos of adjacentPositions) {
    const s = scoreAction(agent, ActionType.Move, pos, archetype, stats, allAgents, zone, rng);
    candidates.push({ action: ActionType.Move, target: pos, score: s });
  }

  // Attack candidates - target nearest enemies
  for (const enemy of aliveEnemies) {
    const s = scoreAction(agent, ActionType.Attack, enemy.position, archetype, stats, allAgents, zone, rng);
    candidates.push({ action: ActionType.Attack, target: enemy.position, score: s });
  }

  // Defend - no target
  {
    const s = scoreAction(agent, ActionType.Defend, null, archetype, stats, allAgents, zone, rng);
    candidates.push({ action: ActionType.Defend, target: null, score: s });
  }

  // Charge - no target
  {
    const s = scoreAction(agent, ActionType.Charge, null, archetype, stats, allAgents, zone, rng);
    candidates.push({ action: ActionType.Charge, target: null, score: s });
  }

  // Special - target depends on archetype
  if (archetype === Archetype.Brawler || archetype === Archetype.Survivor) {
    const s = scoreAction(agent, ActionType.Special, agent.position, archetype, stats, allAgents, zone, rng);
    candidates.push({ action: ActionType.Special, target: agent.position, score: s });
  } else if (archetype === Archetype.Tactician && aliveEnemies.length > 0) {
    // Place trap near nearest enemy
    const nearest = aliveEnemies.reduce((closest, e) =>
      manhattanDistance(agent.position, e.position) <
      manhattanDistance(agent.position, closest.position)
        ? e
        : closest,
    );
    const s = scoreAction(agent, ActionType.Special, nearest.position, archetype, stats, allAgents, zone, rng);
    candidates.push({ action: ActionType.Special, target: nearest.position, score: s });
  }

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Pick highest-scoring action that the agent can afford
  for (const candidate of candidates) {
    if (agent.energy >= getEnergyCost(candidate.action)) {
      return { action: candidate.action, target: candidate.target };
    }
  }

  // Fallback to Charge (always free)
  return { action: ActionType.Charge, target: null };
}
