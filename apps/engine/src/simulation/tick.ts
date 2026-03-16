import { ActionType } from "@agent-royale/shared";
import type {
  AgentState,
  AgentStats,
  Archetype,
  TickEvent,
  TickAction,
  Position,
} from "@agent-royale/shared";
import { decideAction, type SeededRandom } from "./agent-ai.js";
import {
  executeMove,
  executeAttack,
  executeDefend,
  executeCharge,
  executeSpecial,
} from "./actions.js";
import { isInZone, getZoneDamage, type ZoneState } from "./zone.js";

export function processTick(
  tickNumber: number,
  agents: AgentState[],
  agentData: Map<string, { archetype: Archetype; stats: AgentStats }>,
  zone: ZoneState,
  rng: SeededRandom,
  traps: Map<string, { damage: number; owner: string }>,
): TickEvent {
  const actions: TickAction[] = [];
  const eliminations: string[] = [];

  // Clone agents for mutation
  let currentAgents = agents.map((a) => ({ ...a }));

  // Reset defending status from previous tick
  currentAgents = currentAgents.map((a) => ({ ...a, isDefending: false }));

  // Sort alive agents by agility descending for priority
  const aliveAgents = currentAgents
    .filter((a) => a.isAlive)
    .sort((a, b) => {
      const dataA = agentData.get(a.agentId);
      const dataB = agentData.get(b.agentId);
      return (dataB?.stats.agility ?? 0) - (dataA?.stats.agility ?? 0);
    });

  for (const agent of aliveAgents) {
    const data = agentData.get(agent.agentId);
    if (!data) continue;

    // Get current state from currentAgents array (may have been updated by others)
    const agentIndex = currentAgents.findIndex(
      (a) => a.agentId === agent.agentId,
    );
    const currentState = currentAgents[agentIndex];
    if (!currentState.isAlive) continue;

    const decision = decideAction(
      currentState,
      data.archetype,
      data.stats,
      currentAgents,
      zone,
      rng,
    );

    let tickAction: TickAction = {
      agentId: currentState.agentId,
      action: decision.action,
      target: decision.target,
      damage: null,
    };

    switch (decision.action) {
      case ActionType.Move: {
        const result = executeMove(
          currentState,
          decision.target!,
          data.stats,
        );
        currentAgents[agentIndex] = result;
        break;
      }
      case ActionType.Attack: {
        const result = executeAttack(
          currentState,
          decision.target!,
          data.stats,
          currentAgents,
          rng,
        );
        currentAgents[agentIndex] = result.attacker;
        let totalDamage = 0;
        for (const damaged of result.damaged) {
          const dIdx = currentAgents.findIndex(
            (a) => a.agentId === damaged.agentId,
          );
          if (dIdx >= 0) {
            totalDamage += currentAgents[dIdx].hp - damaged.hp;
            currentAgents[dIdx] = damaged;
            if (!damaged.isAlive) {
              eliminations.push(damaged.agentId);
            }
          }
        }
        tickAction = { ...tickAction, damage: totalDamage || null };
        break;
      }
      case ActionType.Defend: {
        const result = executeDefend(currentState);
        currentAgents[agentIndex] = result;
        break;
      }
      case ActionType.Charge: {
        const result = executeCharge(currentState);
        currentAgents[agentIndex] = result;
        break;
      }
      case ActionType.Special: {
        const result = executeSpecial(
          currentState,
          decision.target ?? currentState.position,
          data.archetype,
          data.stats,
          currentAgents,
        );
        currentAgents[agentIndex] = result.agent;
        let totalDamage = 0;
        for (const affected of result.affected) {
          const aIdx = currentAgents.findIndex(
            (a) => a.agentId === affected.agentId,
          );
          if (aIdx >= 0) {
            totalDamage += currentAgents[aIdx].hp - affected.hp;
            currentAgents[aIdx] = affected;
            if (!affected.isAlive) {
              eliminations.push(affected.agentId);
            }
          }
        }

        // Handle Tactician trap storage
        if (data.archetype === 1 && decision.target) {
          const trapKey = `${decision.target.x}:${decision.target.y}`;
          traps.set(trapKey, {
            damage: data.stats.strength * 2,
            owner: currentState.agentId,
          });
        }

        tickAction = { ...tickAction, damage: totalDamage || null };
        break;
      }
    }

    actions.push(tickAction);
  }

  // Apply zone damage to agents outside zone
  for (let i = 0; i < currentAgents.length; i++) {
    const agent = currentAgents[i];
    if (agent.isAlive && !isInZone(agent.position, zone)) {
      const damage = getZoneDamage();
      const newHp = Math.max(0, agent.hp - damage);
      currentAgents[i] = {
        ...agent,
        hp: newHp,
        isAlive: newHp > 0,
      };
      if (newHp <= 0 && !eliminations.includes(agent.agentId)) {
        eliminations.push(agent.agentId);
      }
    }
  }

  // Check trap triggers for agents that moved this tick
  for (let i = 0; i < currentAgents.length; i++) {
    const agent = currentAgents[i];
    if (!agent.isAlive) continue;

    const trapKey = `${agent.position.x}:${agent.position.y}`;
    const trap = traps.get(trapKey);
    if (trap && trap.owner !== agent.agentId) {
      const damage = agent.isDefending
        ? Math.floor(trap.damage / 2)
        : trap.damage;
      const newHp = Math.max(0, agent.hp - damage);
      currentAgents[i] = {
        ...agent,
        hp: newHp,
        isAlive: newHp > 0,
      };
      if (newHp <= 0 && !eliminations.includes(agent.agentId)) {
        eliminations.push(agent.agentId);
      }
      traps.delete(trapKey);
    }
  }

  return {
    tick: tickNumber,
    actions,
    eliminations,
    zoneBounds: { min: { ...zone.min }, max: { ...zone.max } },
    agentStates: currentAgents.map((a) => ({ ...a })),
  };
}
