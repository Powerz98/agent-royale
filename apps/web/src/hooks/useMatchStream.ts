"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { TickEvent } from "@agent-royale/shared";

const ENGINE_URL =
  process.env.NEXT_PUBLIC_ENGINE_URL || "http://localhost:3001";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export function useMatchStream(matchId: string) {
  const [events, setEvents] = useState<TickEvent[]>([]);
  const [currentTick, setCurrentTick] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const eventSourceRef = useRef<EventSource | null>(null);
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!matchId || isComplete) return;

    cleanup();
    setConnectionStatus("connecting");

    const url = `${ENGINE_URL}/matches/${matchId}/stream`;
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnectionStatus("connected");
      retryCountRef.current = 0;
    };

    eventSource.onmessage = (event) => {
      try {
        const data: TickEvent = JSON.parse(event.data);
        setEvents((prev) => [...prev, data]);
        setCurrentTick(data.tick);
      } catch (err) {
        console.error("Failed to parse SSE event:", err);
      }
    };

    eventSource.addEventListener("end", () => {
      setIsComplete(true);
      setConnectionStatus("disconnected");
      cleanup();
    });

    eventSource.onerror = () => {
      eventSource.close();
      eventSourceRef.current = null;

      if (isComplete) {
        setConnectionStatus("disconnected");
        return;
      }

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        console.warn(
          `SSE connection lost. Retrying (${retryCountRef.current}/${MAX_RETRIES}) in ${RETRY_DELAY_MS}ms...`
        );
        setConnectionStatus("connecting");
        retryTimeoutRef.current = setTimeout(() => {
          connect();
        }, RETRY_DELAY_MS);
      } else {
        console.error(`SSE connection failed after ${MAX_RETRIES} retries.`);
        setConnectionStatus("error");
      }
    };
  }, [matchId, isComplete, cleanup]);

  useEffect(() => {
    if (!matchId) return;

    retryCountRef.current = 0;
    connect();

    return () => {
      cleanup();
    };
  }, [matchId, connect, cleanup]);

  const latestEvent = events.length > 0 ? events[events.length - 1] : null;

  return { events, currentTick, isComplete, latestEvent, connectionStatus };
}
