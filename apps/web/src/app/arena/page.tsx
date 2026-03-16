"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

interface AgentSummary { id: string; name: string; archetype: number; }
interface MatchData { id: string; status: string; entryFee: string; agents: AgentSummary[]; winner: AgentSummary | null; createdAt: string; }

const statusConfig: Record<string, { label: string; color: string }> = {
  waiting: { label: "Waiting", color: "#E0E0E0" },
  InProgress: { label: "Live", color: "#FFFFFF" },
  Completed: { label: "Completed", color: "#F8FAFC" },
  Cancelled: { label: "Cancelled", color: "#999999" },
};

export default function ArenaPage() {
  const { address } = useAccount();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [userAgents, setUserAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [enteringMatchId, setEnteringMatchId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error("Failed to fetch matches");
      setMatches(await res.json());
    } catch (err) { setError((err as Error).message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);
  useEffect(() => {
    if (!address) return;
    fetch(`/api/agents?owner=${address}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setUserAgents(d); }).catch(() => {});
  }, [address]);

  const handleCreateMatch = async () => {
    setCreating(true);
    try { const res = await fetch("/api/matches", { method: "POST" }); if (!res.ok) throw new Error("Failed"); await fetchMatches(); }
    catch (err) { setError((err as Error).message); } finally { setCreating(false); }
  };

  const handleEnterMatch = async (matchId: string) => {
    if (!selectedAgent) return;
    setEnteringMatchId(matchId);
    try {
      const res = await fetch(`/api/matches/${matchId}/enter`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agentId: selectedAgent }) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      const data = await res.json();
      if (data.isFull) await fetch(`/api/matches/${matchId}/start`, { method: "POST" });
      await fetchMatches(); setSelectedAgent(null);
    } catch (err) { setError((err as Error).message); } finally { setEnteringMatchId(null); }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-['Orbitron'] text-5xl font-bold text-[#F8FAFC]">
            <span className="text-[#FFFFFF]" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>Battle</span> Arena
          </h1>
          <p className="mt-2 text-lg text-[#F8FAFC]/50">Enter matches, spectate battles, claim victories</p>
        </div>
        <button
          type="button"
          onClick={handleCreateMatch}
          disabled={creating}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#FFFFFF] px-6 py-3 font-semibold text-black transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-lg shadow-[#FFFFFF]/25 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          {creating ? "Creating..." : "Create Match"}
        </button>
      </div>

      {userAgents.length > 0 && (
        <div className="mb-8 rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-4" style={{ boxShadow: "var(--shadow-md)" }}>
          <p className="mb-3 font-['Orbitron'] text-xs font-medium uppercase tracking-widest text-[#FFFFFF]">Select Agent to Enter</p>
          <div className="flex flex-wrap gap-3">
            {userAgents.map((agent) => (
              <button key={agent.id} type="button" onClick={() => setSelectedAgent(agent.id)}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  selectedAgent === agent.id ? "border-[#FFFFFF] bg-[#FFFFFF]/15 text-[#FFFFFF]" : "border-[#F8FAFC]/15 text-[#F8FAFC]/60 hover:border-[#FFFFFF]/40"
                }`}
              >{agent.name}</button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-32"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF]" /></div>}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="font-semibold text-red-400">{error}</p>
          <button type="button" onClick={() => setError(null)} className="cursor-pointer mt-2 text-sm text-[#F8FAFC]/40 underline">Dismiss</button>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[#F8FAFC]/10 bg-[#000000] py-24">
          <p className="font-['Orbitron'] text-xl font-semibold text-[#F8FAFC]/30">No matches yet</p>
          <p className="mt-2 text-sm text-[#F8FAFC]/20">Create a match to get the battles started</p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((match) => {
            const status = statusConfig[match.status] ?? statusConfig.waiting;
            return (
              <article key={match.id} className="cursor-pointer rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFFFFF]/40" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-['Orbitron'] text-base font-semibold text-[#F8FAFC]">Match #{match.id.slice(-6)}</h3>
                  <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider" style={{ color: status.color, backgroundColor: `${status.color}20` }}>{status.label}</span>
                </div>
                <div className="mb-5 flex items-center gap-6 text-sm text-[#F8FAFC]/50">
                  <span className="font-semibold">{match.agents.length}/8 agents</span>
                  <span className="font-semibold">{match.entryFee} ETH</span>
                </div>
                <div>
                  {match.status === "waiting" && (
                    <button type="button" onClick={() => handleEnterMatch(match.id)} disabled={!selectedAgent || enteringMatchId === match.id}
                      className="cursor-pointer w-full rounded-lg border-2 border-[#FFFFFF] px-4 py-2.5 text-sm font-semibold text-[#FFFFFF] transition-all duration-200 hover:bg-[#FFFFFF]/10 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/30"
                    >{enteringMatchId === match.id ? "Entering..." : selectedAgent ? "Enter Match" : "Select an Agent"}</button>
                  )}
                  {match.status === "InProgress" && (
                    <Link href={`/arena/${match.id}`} className="cursor-pointer flex w-full items-center justify-center rounded-lg bg-[#FFFFFF]/20 px-4 py-2.5 text-sm font-semibold text-[#FFFFFF] transition-all duration-200 hover:bg-[#FFFFFF]/30">
                      Spectate Live
                    </Link>
                  )}
                  {match.status === "Completed" && match.winner && (
                    <p className="text-center text-sm text-[#F8FAFC]/40">Winner: <span className="font-semibold text-[#FFFFFF]">{match.winner.name}</span></p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
