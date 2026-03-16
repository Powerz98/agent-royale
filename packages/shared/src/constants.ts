import { Archetype, ActionType } from "./types.js";

// Grid & match settings
export const GRID_SIZE = 20;
export const MAX_TICKS = 200;
export const MAX_AGENTS_PER_MATCH = 8;

// Zone settings
export const ZONE_SHRINK_INTERVAL = 40;
export const ZONE_DAMAGE = 10;

// Timing
export const TICK_DURATION_MS = 500;

// Economics (ETH values)
export const MINT_PRICE = "0.002";
export const ENTRY_FEE = "0.001";
export const PLATFORM_CUT_BPS = 1000; // 10%

// Supply
export const MAX_SUPPLY = 10000;

// Chain IDs
export const BASE_CHAIN_ID = 8453;
export const BASE_SEPOLIA_CHAIN_ID = 84532;

// Display names
export const ARCHETYPE_NAMES: Record<Archetype, string> = {
  [Archetype.Brawler]: "Brawler",
  [Archetype.Tactician]: "Tactician",
  [Archetype.Survivor]: "Survivor",
};

export const ACTION_NAMES: Record<ActionType, string> = {
  [ActionType.Move]: "Move",
  [ActionType.Attack]: "Attack",
  [ActionType.Defend]: "Defend",
  [ActionType.Charge]: "Charge",
  [ActionType.Special]: "Special",
};

// Energy
export const STARTING_ENERGY = 100;
export const MOVE_COST = 5;
export const ATTACK_COST = 15;
export const DEFEND_COST = 10;
export const CHARGE_COST = 0; // restores 20 energy
export const SPECIAL_COST = 30;
