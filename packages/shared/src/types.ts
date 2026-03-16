export enum Archetype {
  Brawler = 0,
  Tactician = 1,
  Survivor = 2,
}

export enum ActionType {
  Move = 0,
  Attack = 1,
  Defend = 2,
  Charge = 3,
  Special = 4,
}

export interface AgentStats {
  strength: number;
  agility: number;
  resilience: number;
  intelligence: number;
}

export interface Agent {
  id: string;
  tokenId: number;
  name: string;
  archetype: Archetype;
  stats: AgentStats;
  owner: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface AgentState {
  agentId: string;
  position: Position;
  hp: number;
  maxHp: number;
  energy: number;
  isAlive: boolean;
  isDefending: boolean;
  statusEffects: string[];
}

export interface TickAction {
  agentId: string;
  action: ActionType;
  target: Position | null;
  damage: number | null;
}

export interface TickEvent {
  tick: number;
  actions: TickAction[];
  eliminations: string[];
  zoneBounds: {
    min: Position;
    max: Position;
  };
  agentStates: AgentState[];
}

export enum MatchStatus {
  Waiting = "Waiting",
  InProgress = "InProgress",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export interface Match {
  id: string;
  matchId: number;
  status: MatchStatus;
  entryFee: string;
  agents: Agent[];
  winner: Agent | null;
  totalTicks: number;
  createdAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
}

export interface MatchResult {
  matchId: string;
  winner: string;
  placements: string[];
  totalTicks: number;
  events: TickEvent[];
}
