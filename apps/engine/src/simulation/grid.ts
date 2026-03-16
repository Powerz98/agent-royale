import { GRID_SIZE } from "@agent-royale/shared";
import type { Position } from "@agent-royale/shared";

export { GRID_SIZE };

export function isInBounds(pos: Position): boolean {
  return pos.x >= 0 && pos.x < GRID_SIZE && pos.y >= 0 && pos.y < GRID_SIZE;
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function getAdjacentPositions(pos: Position): Position[] {
  const deltas = [
    { x: 0, y: 1 },
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: -1, y: 0 },
  ];

  return deltas
    .map((d) => ({ x: pos.x + d.x, y: pos.y + d.y }))
    .filter(isInBounds);
}
