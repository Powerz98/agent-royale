"use client";

import React, { useEffect, useRef } from "react";
import { useMatchStream } from "@/hooks/useMatchStream";
import BattleCanvas from "@/components/arena/BattleCanvas";
import EventLog from "@/components/arena/EventLog";

export default function SpectatorPage({ params }: { params: { matchId: string } }) {
  const { matchId } = params;
  const { events, currentTick, isComplete, latestEvent } = useMatchStream(matchId);
  const winner = isComplete ? latestEvent?.agentStates.find((a) => a.isAlive) : null;
  const settledRef = useRef(false);

  // Auto-settle when match completes
  useEffect(() => {
    if (!isComplete || settledRef.current) return;
    settledRef.current = true;
    fetch(`/api/matches/${matchId}/settle`, { method: "POST" }).catch(console.error);
  }, [isComplete, matchId]);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#F8FAFC]/10 bg-[#000000] px-6 py-4" style={{ boxShadow: "var(--shadow-md)" }}>
        <h1 className="font-['Orbitron'] text-2xl font-bold">
          <span className="text-[#F8FAFC]/50">Match</span> <span className="text-[#FFFFFF]">#{matchId}</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 rounded-lg border border-[#F8FAFC]/10 bg-[#000000] px-4 py-2">
            <span className="font-['Orbitron'] text-sm font-bold text-[#FFFFFF]">Tick {currentTick}</span>
            <span className="text-sm text-[#F8FAFC]/30">/ 200</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isComplete ? "bg-[#F8FAFC]/30" : events.length > 0 ? "animate-pulse bg-[#FFFFFF]" : "animate-pulse bg-[#E0E0E0]"}`} style={!isComplete && events.length > 0 ? { boxShadow: "0 0 8px rgba(255,255,255,0.5)" } : {}} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC]/40">
              {isComplete ? "Completed" : events.length > 0 ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {events.length === 0 && !isComplete && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F8FAFC]/10 bg-[#000000] py-32">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF]" />
          <p className="font-['Orbitron'] text-lg font-semibold text-[#F8FAFC]/40">Waiting for match data...</p>
        </div>
      )}

      {events.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="relative overflow-hidden rounded-xl border border-[#F8FAFC]/10 bg-black p-4">
            <BattleCanvas agentStates={latestEvent?.agentStates ?? []} zoneBounds={latestEvent?.zoneBounds ?? { min: { x: 0, y: 0 }, max: { x: 20, y: 20 } }} tick={currentTick} />
            {isComplete && winner && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/80 backdrop-blur-sm">
                <p className="font-['Orbitron'] text-sm font-bold uppercase tracking-[0.3em] text-[#FFFFFF]/70">Victory</p>
                <h2 className="mt-2 font-['Orbitron'] text-4xl font-bold text-[#FFFFFF]" style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>{winner.agentId}</h2>
              </div>
            )}
          </div>
          <div className="flex h-[600px] flex-col rounded-xl border border-[#F8FAFC]/10 bg-[#000000]">
            <div className="flex items-center justify-between border-b border-[#F8FAFC]/10 px-5 py-3">
              <h2 className="font-['Orbitron'] text-xs font-medium uppercase tracking-widest text-[#F8FAFC]/50">Event Log</h2>
              <span className="text-xs text-[#F8FAFC]/30">{events.length} events</span>
            </div>
            <div className="flex-1 overflow-y-auto"><EventLog events={events} /></div>
          </div>
        </div>
      )}

      {latestEvent && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {latestEvent.agentStates.map((agent) => (
            <div key={agent.agentId} className={`rounded-lg border p-3 text-sm transition-all duration-200 ${agent.isAlive ? "border-[#F8FAFC]/10 bg-[#000000]" : "border-[#F8FAFC]/5 bg-[#000000]/50 opacity-40"}`}>
              <div className="flex items-center justify-between">
                <span className="truncate font-semibold text-[#F8FAFC]">{agent.agentId.slice(0, 10)}</span>
                {!agent.isAlive && <span className="text-xs font-bold text-[#F8FAFC]/40">DEAD</span>}
              </div>
              {agent.isAlive && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#F8FAFC]/10">
                    <div className="h-1.5 rounded-full transition-all duration-200" style={{ width: `${(agent.hp / agent.maxHp) * 100}%`, backgroundColor: agent.hp / agent.maxHp > 0.5 ? "#FFFFFF" : agent.hp / agent.maxHp > 0.25 ? "#E0E0E0" : "#999999" }} />
                  </div>
                  <div className="mt-1 text-xs text-[#F8FAFC]/40">{agent.hp}/{agent.maxHp} HP</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isComplete && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative rounded-2xl border-2 border-[#FFFFFF] bg-[#000000] px-16 py-12 text-center" style={{ boxShadow: "0 0 60px rgba(255,255,255,0.2)" }}>
            <p className="mb-2 font-['Orbitron'] text-sm font-bold uppercase tracking-[0.3em] text-[#FFFFFF]/70">Victory</p>
            <h2 className="font-['Orbitron'] text-5xl font-bold text-[#FFFFFF]" style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>{winner.agentId}</h2>
            <p className="mt-3 text-lg text-[#F8FAFC]/50">is the last agent standing!</p>
            <p className="mt-1 text-sm text-[#F8FAFC]/30">Match ended at tick {currentTick}</p>
            <a href="/arena" className="cursor-pointer mt-8 inline-block rounded-lg bg-[#FFFFFF] px-8 py-3 font-semibold text-black transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-lg shadow-[#FFFFFF]/25">Back to Arena</a>
          </div>
        </div>
      )}
    </div>
  );
}
