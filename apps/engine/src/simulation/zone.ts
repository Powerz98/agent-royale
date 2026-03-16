import { GRID_SIZE, ZONE_DAMAGE } from "@agent-royale/shared";
import type { Position } from "@agent-royale/shared";

export interface ZoneState {
  min: Position;
  max: Position;
  ticksUntilShrink: number;
}

export function createInitialZone(): ZoneState {
  return {
    min: { x: 0, y: 0 },
    max: { x: GRID_SIZE - 1, y: GRID_SIZE - 1 },
    ticksUntilShrink: 0,
  };
}

export function shrinkZone(zone: ZoneState): ZoneState {
  return {
    min: { x: zone.min.x + 1, y: zone.min.y + 1 },
    max: { x: zone.max.x - 1, y: zone.max.y - 1 },
    ticksUntilShrink: zone.ticksUntilShrink,
  };
}

export function isInZone(pos: Position, zone: ZoneState): boolean {
  return (
    pos.x >= zone.min.x &&
    pos.x <= zone.max.x &&
    pos.y >= zone.min.y &&
    pos.y <= zone.max.y
  );
}

export function getZoneDamage(): number {
  return ZONE_DAMAGE;
}
