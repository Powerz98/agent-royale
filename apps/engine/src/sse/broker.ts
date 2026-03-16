import type { TickEvent, MatchResult } from "@agent-royale/shared";

interface MatchEntry {
  events: TickEvent[];
  listeners: Set<(event: TickEvent) => void>;
  complete: boolean;
  result?: MatchResult;
}

export class MatchBroker {
  private matches: Map<string, MatchEntry> = new Map();

  startMatch(matchId: string): void {
    this.matches.set(matchId, {
      events: [],
      listeners: new Set(),
      complete: false,
    });
  }

  publishTick(matchId: string, event: TickEvent): void {
    const entry = this.matches.get(matchId);
    if (!entry) return;

    entry.events.push(event);
    for (const listener of entry.listeners) {
      listener(event);
    }
  }

  completeMatch(matchId: string, result?: MatchResult): void {
    const entry = this.matches.get(matchId);
    if (!entry) return;

    entry.complete = true;
    entry.result = result;
  }

  subscribe(
    matchId: string,
    callback: (event: TickEvent) => void,
  ): () => void {
    const entry = this.matches.get(matchId);
    if (!entry) return () => {};

    // Send past events for catch-up
    for (const event of entry.events) {
      callback(event);
    }

    entry.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      entry.listeners.delete(callback);
    };
  }

  getEvents(matchId: string): TickEvent[] | null {
    const entry = this.matches.get(matchId);
    if (!entry) return null;
    return entry.events;
  }

  isComplete(matchId: string): boolean {
    const entry = this.matches.get(matchId);
    return entry?.complete ?? false;
  }

  getResult(matchId: string): MatchResult | undefined {
    return this.matches.get(matchId)?.result;
  }

  hasMatch(matchId: string): boolean {
    return this.matches.has(matchId);
  }
}

export const broker = new MatchBroker();
