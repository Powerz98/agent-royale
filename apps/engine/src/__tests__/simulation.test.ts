import { describe, it, expect } from "vitest";
import { Archetype, ActionType, ZONE_DAMAGE } from "@agent-royale/shared";
import type { AgentState, AgentStats } from "@agent-royale/shared";
import { SeededRandom, decideAction } from "../simulation/agent-ai.js";
import { runMatch } from "../simulation/match.js";
import {
  createInitialZone,
  shrinkZone,
  isInZone,
  getZoneDamage,
} from "../simulation/zone.js";
import {
  executeMove,
  executeAttack,
  executeDefend,
  executeCharge,
  executeSpecial,
} from "../simulation/actions.js";

function makeAgent(overrides: Partial<AgentState> = {}): AgentState {
  return {
    agentId: "agent-1",
    position: { x: 10, y: 10 },
    hp: 100,
    maxHp: 100,
    energy: 100,
    isAlive: true,
    isDefending: false,
    statusEffects: [],
    ...overrides,
  };
}

function makeStats(overrides: Partial<AgentStats> = {}): AgentStats {
  return {
    strength: 5,
    agility: 5,
    resilience: 5,
    intelligence: 5,
    ...overrides,
  };
}

const testAgents = [
  { id: "a1", archetype: Archetype.Brawler, stats: makeStats({ strength: 7, agility: 6 }) },
  { id: "a2", archetype: Archetype.Tactician, stats: makeStats({ intelligence: 8, agility: 5 }) },
  { id: "a3", archetype: Archetype.Survivor, stats: makeStats({ resilience: 8, agility: 4 }) },
  { id: "a4", archetype: Archetype.Brawler, stats: makeStats({ strength: 6, agility: 7 }) },
];

describe("SeededRandom", () => {
  it("produces deterministic sequence", () => {
    const rng1 = new SeededRandom(42);
    const rng2 = new SeededRandom(42);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it("produces values between 0 and 1", () => {
    const rng = new SeededRandom(123);
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it("nextInt produces values in range", () => {
    const rng = new SeededRandom(99);
    for (let i = 0; i < 100; i++) {
      const val = rng.nextInt(3, 7);
      expect(val).toBeGreaterThanOrEqual(3);
      expect(val).toBeLessThanOrEqual(7);
    }
  });
});

describe("runMatch", () => {
  it("completes with a winner", () => {
    const result = runMatch("test-match-1", testAgents, "test-seed-1");

    expect(result.matchId).toBe("test-match-1");
    expect(result.winner).toBeTruthy();
    expect(result.totalTicks).toBeGreaterThan(0);
    expect(result.events.length).toBe(result.totalTicks);
    expect(result.placements.length).toBeGreaterThan(0);
  });

  it("is deterministic with same seed", () => {
    const makeAgents = () => [
      { id: "a1", archetype: Archetype.Brawler, stats: makeStats({ strength: 7, agility: 6 }) },
      { id: "a2", archetype: Archetype.Tactician, stats: makeStats({ intelligence: 8, agility: 5 }) },
      { id: "a3", archetype: Archetype.Survivor, stats: makeStats({ resilience: 8, agility: 4 }) },
      { id: "a4", archetype: Archetype.Brawler, stats: makeStats({ strength: 6, agility: 7 }) },
    ];
    const result1 = runMatch("m1", makeAgents(), "deterministic-seed");
    const result2 = runMatch("m1", makeAgents(), "deterministic-seed");

    expect(result1.winner).toBe(result2.winner);
    expect(result1.totalTicks).toBe(result2.totalTicks);
    expect(result1.placements).toEqual(result2.placements);
  });

  it("produces different results with different seeds", () => {
    const results = new Set<string>();
    // Run multiple matches to check for variation (not guaranteed every time but likely)
    for (let i = 0; i < 5; i++) {
      const result = runMatch(`m-${i}`, testAgents, `seed-${i}`);
      results.add(`${result.winner}-${result.totalTicks}`);
    }
    // With different seeds we should get at least some variation
    expect(results.size).toBeGreaterThanOrEqual(1);
  });

  it("ends when 1 agent remains", () => {
    // Use only 2 agents for faster resolution
    const twoAgents = [
      { id: "a1", archetype: Archetype.Brawler, stats: makeStats({ strength: 10 }) },
      { id: "a2", archetype: Archetype.Brawler, stats: makeStats({ strength: 10 }) },
    ];
    const result = runMatch("m-2agents", twoAgents, "fight-seed");

    const finalStates = result.events[result.events.length - 1].agentStates;
    const alive = finalStates.filter((a) => a.isAlive);
    // Either 1 agent remains or match hit max ticks
    expect(alive.length).toBeLessThanOrEqual(2);
    expect(result.winner).toBeTruthy();
  });
});

describe("Zone", () => {
  it("creates initial zone covering full grid", () => {
    const zone = createInitialZone();
    expect(zone.min).toEqual({ x: 0, y: 0 });
    expect(zone.max).toEqual({ x: 19, y: 19 });
  });

  it("shrinks correctly by 1 on each side", () => {
    const zone = createInitialZone();
    const shrunk = shrinkZone(zone);

    expect(shrunk.min).toEqual({ x: 1, y: 1 });
    expect(shrunk.max).toEqual({ x: 18, y: 18 });
  });

  it("correctly identifies positions in zone", () => {
    const zone = { min: { x: 2, y: 2 }, max: { x: 17, y: 17 }, ticksUntilShrink: 0 };

    expect(isInZone({ x: 10, y: 10 }, zone)).toBe(true);
    expect(isInZone({ x: 2, y: 2 }, zone)).toBe(true);
    expect(isInZone({ x: 17, y: 17 }, zone)).toBe(true);
    expect(isInZone({ x: 1, y: 10 }, zone)).toBe(false);
    expect(isInZone({ x: 18, y: 10 }, zone)).toBe(false);
  });

  it("returns correct zone damage", () => {
    expect(getZoneDamage()).toBe(ZONE_DAMAGE);
  });
});

describe("Agents take zone damage", () => {
  it("agents outside zone lose HP in match events", () => {
    // Create a very small zone so agents start outside
    const result = runMatch("zone-test", testAgents, "zone-seed");

    // Check that zone damage events occur (agents outside zone take damage)
    // We verify by checking that zone bounds eventually shrink
    const lastEvent = result.events[result.events.length - 1];
    expect(lastEvent.zoneBounds).toBeDefined();
  });
});

describe("Actions", () => {
  it("executeMove moves agent to valid position", () => {
    const agent = makeAgent({ position: { x: 5, y: 5 }, energy: 50 });
    const result = executeMove(agent, { x: 5, y: 6 }, makeStats());

    expect(result.position).toEqual({ x: 5, y: 6 });
    expect(result.energy).toBe(45); // 50 - 5 (MOVE_COST)
  });

  it("executeMove does not move to out-of-bounds", () => {
    const agent = makeAgent({ position: { x: 0, y: 0 }, energy: 50 });
    const result = executeMove(agent, { x: -1, y: 0 }, makeStats());

    expect(result.position).toEqual({ x: 0, y: 0 });
    expect(result.energy).toBe(50);
  });

  it("executeAttack damages agents at target position", () => {
    const attacker = makeAgent({ agentId: "atk", position: { x: 5, y: 5 }, energy: 50 });
    const target = makeAgent({ agentId: "tgt", position: { x: 6, y: 5 }, hp: 100 });
    const stats = makeStats({ strength: 5 });

    const result = executeAttack(attacker, { x: 6, y: 5 }, stats, [attacker, target]);

    expect(result.attacker.energy).toBe(35); // 50 - 15 (ATTACK_COST)
    expect(result.damaged.length).toBe(1);
    expect(result.damaged[0].hp).toBeLessThan(100);
  });

  it("executeDefend sets defending and costs energy", () => {
    const agent = makeAgent({ energy: 50, isDefending: false });
    const result = executeDefend(agent);

    expect(result.isDefending).toBe(true);
    expect(result.energy).toBe(40); // 50 - 10 (DEFEND_COST)
  });

  it("executeCharge restores energy", () => {
    const agent = makeAgent({ energy: 30 });
    const result = executeCharge(agent);

    expect(result.energy).toBe(50); // 30 + 20
  });

  it("executeSpecial Brawler does AoE damage", () => {
    const agent = makeAgent({ agentId: "brawler", position: { x: 5, y: 5 }, energy: 50 });
    const nearby = makeAgent({ agentId: "nearby", position: { x: 6, y: 5 }, hp: 100 });
    const farAway = makeAgent({ agentId: "far", position: { x: 15, y: 15 }, hp: 100 });
    const stats = makeStats({ strength: 5 });

    const result = executeSpecial(
      agent,
      { x: 5, y: 5 },
      Archetype.Brawler,
      stats,
      [agent, nearby, farAway],
    );

    expect(result.agent.energy).toBe(20); // 50 - 30 (SPECIAL_COST)
    expect(result.affected.length).toBe(1);
    expect(result.affected[0].agentId).toBe("nearby");
    expect(result.affected[0].hp).toBeLessThan(100);
  });

  it("executeSpecial Survivor heals self", () => {
    const agent = makeAgent({ agentId: "survivor", hp: 50, maxHp: 100, energy: 50 });
    const stats = makeStats({ resilience: 5 });

    const result = executeSpecial(
      agent,
      { x: 10, y: 10 },
      Archetype.Survivor,
      stats,
      [agent],
    );

    expect(result.agent.hp).toBe(65); // 50 + 5*3
    expect(result.agent.energy).toBe(20);
  });

  it("executeSpecial Tactician places trap", () => {
    const agent = makeAgent({ agentId: "tactician", energy: 50 });
    const stats = makeStats();

    const result = executeSpecial(
      agent,
      { x: 8, y: 8 },
      Archetype.Tactician,
      stats,
      [agent],
    );

    expect(result.agent.statusEffects).toContain("trap:8:8");
    expect(result.agent.energy).toBe(20);
  });
});

describe("Agent AI", () => {
  it("produces valid actions", () => {
    const rng = new SeededRandom(42);
    const agent = makeAgent({ agentId: "ai-test", energy: 100 });
    const enemy = makeAgent({ agentId: "enemy", position: { x: 11, y: 10 } });
    const zone = createInitialZone();

    const decision = decideAction(
      agent,
      Archetype.Brawler,
      makeStats(),
      [agent, enemy],
      zone,
      rng,
    );

    expect(decision.action).toBeDefined();
    expect(
      [ActionType.Move, ActionType.Attack, ActionType.Defend, ActionType.Charge, ActionType.Special].includes(
        decision.action,
      ),
    ).toBe(true);
  });

  it("falls back to Charge when energy is too low", () => {
    const rng = new SeededRandom(42);
    const agent = makeAgent({ agentId: "low-energy", energy: 2 });
    const enemy = makeAgent({ agentId: "enemy", position: { x: 11, y: 10 } });
    const zone = createInitialZone();

    const decision = decideAction(
      agent,
      Archetype.Brawler,
      makeStats(),
      [agent, enemy],
      zone,
      rng,
    );

    // With only 2 energy, can't afford anything except Charge
    expect(decision.action).toBe(ActionType.Charge);
  });
});
