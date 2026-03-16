"use client";

import { useRef, useEffect } from "react";
import type { AgentState, Position } from "@agent-royale/shared";
import { GRID_SIZE, ARCHETYPE_NAMES } from "@agent-royale/shared";

interface BattleCanvasProps {
  agentStates: AgentState[];
  zoneBounds: { min: Position; max: Position };
  tick: number;
}

const CANVAS_SIZE = 600;
const CELL_SIZE = 30;

const ARCHETYPE_COLORS: Record<number, string> = {
  0: "#ef4444", // Brawler - red
  1: "#3b82f6", // Tactician - blue
  2: "#22c55e", // Survivor - green
};

export default function BattleCanvas({
  agentStates,
  zoneBounds,
  tick,
}: BattleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // a. Fill background dark
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // b. Draw grid lines
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(CANVAS_SIZE, pos);
      ctx.stroke();
    }

    // c. Draw zone: fill area OUTSIDE zone bounds with semi-transparent red
    const zoneMinX = zoneBounds.min.x * CELL_SIZE;
    const zoneMinY = zoneBounds.min.y * CELL_SIZE;
    const zoneMaxX = zoneBounds.max.x * CELL_SIZE;
    const zoneMaxY = zoneBounds.max.y * CELL_SIZE;

    ctx.fillStyle = "#ef444440";
    // Top strip
    ctx.fillRect(0, 0, CANVAS_SIZE, zoneMinY);
    // Bottom strip
    ctx.fillRect(0, zoneMaxY, CANVAS_SIZE, CANVAS_SIZE - zoneMaxY);
    // Left strip
    ctx.fillRect(0, zoneMinY, zoneMinX, zoneMaxY - zoneMinY);
    // Right strip
    ctx.fillRect(zoneMaxX, zoneMinY, CANVAS_SIZE - zoneMaxX, zoneMaxY - zoneMinY);

    // d. Draw zone border as dashed orange line
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(zoneMinX, zoneMinY, zoneMaxX - zoneMinX, zoneMaxY - zoneMinY);
    ctx.setLineDash([]);

    // Separate alive and dead agents
    const aliveAgents = agentStates.filter((a) => a.isAlive);
    const deadAgents = agentStates.filter((a) => !a.isAlive);

    // h. Dead agents: draw gray X at their last position
    deadAgents.forEach((agent) => {
      const cx = agent.position.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = agent.position.y * CELL_SIZE + CELL_SIZE / 2;

      ctx.strokeStyle = "#6b7280";
      ctx.lineWidth = 3;
      const size = 8;
      ctx.beginPath();
      ctx.moveTo(cx - size, cy - size);
      ctx.lineTo(cx + size, cy + size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + size, cy - size);
      ctx.lineTo(cx - size, cy + size);
      ctx.stroke();
    });

    // e-g. Alive agents
    aliveAgents.forEach((agent) => {
      const cx = agent.position.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = agent.position.y * CELL_SIZE + CELL_SIZE / 2;

      // e. Draw colored circle based on archetype
      const agentIndex = agentStates.indexOf(agent);
      const archetypeKey = agentIndex % 3;
      const color = ARCHETYPE_COLORS[archetypeKey] ?? "#ef4444";

      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff30";
      ctx.lineWidth = 1;
      ctx.stroke();

      // f. Draw HP bar above each agent
      const barWidth = 26;
      const barHeight = 4;
      const barX = cx - barWidth / 2;
      const barY = cy - 18;
      const hpRatio = agent.hp / agent.maxHp;

      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // HP fill: green-to-red gradient based on ratio
      const r = Math.round(255 * (1 - hpRatio));
      const g = Math.round(255 * hpRatio);
      ctx.fillStyle = `rgb(${r}, ${g}, 0)`;
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

      // g. Draw agent ID text below
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(agent.agentId, cx, cy + 22);
    });
  }, [agentStates, zoneBounds, tick]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="rounded-lg border border-gray-800"
    />
  );
}
