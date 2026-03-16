import {
  Archetype,
  MOVE_COST,
  ATTACK_COST,
  DEFEND_COST,
  SPECIAL_COST,
} from "@agent-royale/shared";
import type { AgentState, AgentStats, Position } from "@agent-royale/shared";
import { isInBounds, manhattanDistance } from "./grid.js";
import type { SeededRandom } from "./agent-ai.js";

export function executeMove(
  agent: AgentState,
  target: Position,
  _stats: AgentStats,
): AgentState {
  if (!isInBounds(target)) {
    return agent;
  }
  if (agent.energy < MOVE_COST) {
    return agent;
  }
  return {
    ...agent,
    position: { ...target },
    energy: agent.energy - MOVE_COST,
  };
}

export function executeAttack(
  attacker: AgentState,
  target: Position,
  attackerStats: AgentStats,
  allAgents: AgentState[],
  rng?: SeededRandom,
): { attacker: AgentState; damaged: AgentState[] } {
  if (attacker.energy < ATTACK_COST) {
    return { attacker, damaged: [] };
  }

  const damage = attackerStats.strength * 2 + (rng ? rng.nextInt(0, 3) : Math.floor(Math.random() * 4));
  const damaged: AgentState[] = [];

  const updatedAttacker: AgentState = {
    ...attacker,
    energy: attacker.energy - ATTACK_COST,
  };

  for (const agent of allAgents) {
    if (
      agent.agentId !== attacker.agentId &&
      agent.isAlive &&
      agent.position.x === target.x &&
      agent.position.y === target.y
    ) {
      const actualDamage = agent.isDefending
        ? Math.floor(damage / 2)
        : damage;
      const newHp = Math.max(0, agent.hp - actualDamage);
      damaged.push({
        ...agent,
        hp: newHp,
        isAlive: newHp > 0,
      });
    }
  }

  return { attacker: updatedAttacker, damaged };
}

export function executeDefend(agent: AgentState): AgentState {
  if (agent.energy < DEFEND_COST) {
    return agent;
  }
  return {
    ...agent,
    isDefending: true,
    energy: agent.energy - DEFEND_COST,
  };
}

export function executeCharge(agent: AgentState): AgentState {
  return {
    ...agent,
    energy: agent.energy + 20,
  };
}

export function executeSpecial(
  agent: AgentState,
  target: Position,
  archetype: Archetype,
  stats: AgentStats,
  allAgents: AgentState[],
): { agent: AgentState; affected: AgentState[] } {
  if (agent.energy < SPECIAL_COST) {
    return { agent, affected: [] };
  }

  const updatedAgent: AgentState = {
    ...agent,
    energy: agent.energy - SPECIAL_COST,
  };

  const affected: AgentState[] = [];

  switch (archetype) {
    case Archetype.Brawler: {
      // AoE slam - hits all agents within manhattan distance 2 of agent
      const damage = stats.strength * 3;
      for (const other of allAgents) {
        if (
          other.agentId !== agent.agentId &&
          other.isAlive &&
          manhattanDistance(agent.position, other.position) <= 2
        ) {
          const actualDamage = other.isDefending
            ? Math.floor(damage / 2)
            : damage;
          const newHp = Math.max(0, other.hp - actualDamage);
          affected.push({
            ...other,
            hp: newHp,
            isAlive: newHp > 0,
          });
        }
      }
      break;
    }
    case Archetype.Tactician: {
      // Trap at target position
      const trapEffect = `trap:${target.x}:${target.y}`;
      return {
        agent: {
          ...updatedAgent,
          statusEffects: [...updatedAgent.statusEffects, trapEffect],
        },
        affected,
      };
    }
    case Archetype.Survivor: {
      // Heal self
      const healAmount = stats.resilience * 3;
      const newHp = Math.min(updatedAgent.maxHp, updatedAgent.hp + healAmount);
      return {
        agent: {
          ...updatedAgent,
          hp: newHp,
        },
        affected,
      };
    }
  }

  return { agent: updatedAgent, affected };
}
