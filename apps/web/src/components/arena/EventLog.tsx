"use client";

import { useEffect, useRef } from "react";
import type { TickEvent } from "@agent-royale/shared";
import { ACTION_NAMES, ActionType } from "@agent-royale/shared";

interface EventLogProps {
  events: TickEvent[];
}

export default function EventLog({ events }: EventLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div
      ref={scrollRef}
      className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-800 bg-[#0a0a0f] p-4"
    >
      {events.map((event) => (
        <div key={event.tick} className="mb-4">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Tick {event.tick}
          </h4>

          {event.actions.map((action, i) => (
            <div key={i} className="text-sm text-gray-300">
              <span className="font-medium text-gray-100">
                {action.agentId}
              </span>{" "}
              used{" "}
              <span className="text-blue-400">
                {ACTION_NAMES[action.action as ActionType]}
              </span>
              {action.damage != null && action.damage > 0 && (
                <span className="text-orange-400">
                  {" "}
                  &rarr; {action.damage} dmg
                </span>
              )}
            </div>
          ))}

          {event.eliminations.map((agentId) => (
            <div
              key={agentId}
              className="text-sm font-bold text-red-500"
            >
              &#9760; {agentId} eliminated!
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
