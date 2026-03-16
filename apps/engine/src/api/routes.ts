import { Router } from "express";
import { TICK_DURATION_MS } from "@agent-royale/shared";
import type {
  AgentStats,
  Archetype,
  MatchResult,
} from "@agent-royale/shared";
import { runMatch } from "../simulation/match.js";
import { broker } from "../sse/broker.js";

export const router = Router();

// Store completed results for retrieval
const matchResults = new Map<string, MatchResult>();

router.post("/matches/start", (req, res) => {
  const {
    matchId,
    agents,
    seed,
  }: {
    matchId: string;
    agents: Array<{ id: string; archetype: Archetype; stats: AgentStats }>;
    seed: string;
  } = req.body;

  if (!matchId || !agents || !seed) {
    res.status(400).json({ error: "Missing matchId, agents, or seed" });
    return;
  }

  broker.startMatch(matchId);

  // Run simulation in background, releasing ticks with delay
  const result = runMatch(matchId, agents, seed);

  let tickIndex = 0;
  const releaseTick = () => {
    if (tickIndex < result.events.length) {
      broker.publishTick(matchId, result.events[tickIndex]);
      tickIndex++;
      setTimeout(releaseTick, TICK_DURATION_MS);
    } else {
      broker.completeMatch(matchId, result);
      matchResults.set(matchId, result);
    }
  };

  // Start releasing ticks
  setTimeout(releaseTick, TICK_DURATION_MS);

  res.json({ status: "started" });
});

router.get("/matches/:matchId/stream", (req, res) => {
  const { matchId } = req.params;

  if (!broker.hasMatch(matchId)) {
    res.status(404).json({ error: "Match not found" });
    return;
  }

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const unsubscribe = broker.subscribe(matchId, (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  // Check if match completes
  const checkComplete = setInterval(() => {
    if (broker.isComplete(matchId)) {
      const result = broker.getResult(matchId);
      res.write(`event: end\ndata: ${JSON.stringify(result)}\n\n`);
      clearInterval(checkComplete);
      unsubscribe();
      res.end();
    }
  }, TICK_DURATION_MS / 2);

  // Clean up on client disconnect
  req.on("close", () => {
    clearInterval(checkComplete);
    unsubscribe();
  });
});

router.get("/matches/:matchId/result", (req, res) => {
  const { matchId } = req.params;

  const result = matchResults.get(matchId);
  if (result) {
    res.json(result);
    return;
  }

  if (broker.hasMatch(matchId)) {
    res.status(202).json({ status: "in_progress" });
    return;
  }

  res.status(404).json({ error: "Match not found" });
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});
