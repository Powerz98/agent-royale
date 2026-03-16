"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";

interface AgentData { id: string; tokenId: number; name: string; archetype: number; stats: { strength: number; agility: number; resilience: number; intelligence: number }; wins: number; losses: number; elo: number; }

const archetypeNames: Record<number, string> = { 0: "Brawler", 1: "Tactician", 2: "Survivor" };
const statLabels = [
  { key: "strength" as const, label: "STR" },
  { key: "agility" as const, label: "AGI" },
  { key: "resilience" as const, label: "RES" },
  { key: "intelligence" as const, label: "INT" },
];

function truncateAddress(address: string): string { return `${address.slice(0, 6)}...${address.slice(-4)}`; }

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    fetch(`/api/agents?owner=${address}`).then(r => r.json()).then(d => { if (Array.isArray(d)) setAgents(d); }).catch(() => {}).finally(() => setLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div className="rounded-2xl border border-[#F8FAFC]/10 bg-[#000000] p-12 text-center" style={{ boxShadow: "var(--shadow-xl)" }}>
          <h1 className="mb-3 font-['Orbitron'] text-3xl font-bold text-[#F8FAFC]">Your Profile</h1>
          <p className="mb-8 text-lg text-[#F8FAFC]/50">Connect your wallet to view your agents and match history</p>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="mb-12 flex flex-col items-start gap-4 rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-6 sm:flex-row sm:items-center sm:justify-between" style={{ boxShadow: "var(--shadow-md)" }}>
        <div>
          <p className="font-['Orbitron'] text-xs font-medium uppercase tracking-widest text-[#FFFFFF]">Connected Wallet</p>
          <p className="mt-1 font-mono text-xl font-bold text-[#F8FAFC]">{address ? truncateAddress(address) : ""}</p>
        </div>
        <ConnectKitButton />
      </div>

      <section>
        <h2 className="mb-6 font-['Orbitron'] text-2xl font-bold text-[#F8FAFC]">Your Agents</h2>

        {loading && <div className="flex items-center justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF]" /></div>}

        {!loading && agents.length === 0 && (
          <div className="rounded-xl border border-[#F8FAFC]/10 bg-[#000000] py-16 text-center">
            <p className="font-['Orbitron'] text-lg text-[#F8FAFC]/30">No agents found</p>
            <p className="mt-2 text-sm text-[#F8FAFC]/20">Mint your first agent to get started</p>
          </div>
        )}

        {!loading && agents.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => {
              const totalGames = agent.wins + agent.losses;
              return (
                <article key={agent.id} className="cursor-pointer rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFFFFF]/40" style={{ boxShadow: "var(--shadow-md)" }}>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-['Orbitron'] text-base font-semibold text-[#F8FAFC]">{agent.name}</h3>
                    <span className="rounded-full bg-[#FFFFFF]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
                      {archetypeNames[agent.archetype] ?? "Unknown"}
                    </span>
                  </div>
                  <div className="mb-4 space-y-2.5">
                    {statLabels.map((stat) => (
                      <div key={stat.key} className="flex items-center gap-3">
                        <span className="w-8 text-xs font-bold text-[#F8FAFC]/40">{stat.label}</span>
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#F8FAFC]/10">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-[#FFFFFF] transition-all duration-300" style={{ width: `${agent.stats[stat.key] * 10}%`, boxShadow: "0 0 6px rgba(255,255,255,0.4)" }} />
                        </div>
                        <span className="w-8 text-right text-xs font-bold text-[#F8FAFC]/40">{agent.stats[stat.key]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-[#F8FAFC]/10 pt-3 text-sm">
                    <span className="font-bold text-[#FFFFFF]">{agent.wins}W</span>
                    <span className="text-[#F8FAFC]/20">/</span>
                    <span className="font-bold text-[#999999]">{agent.losses}L</span>
                    {totalGames > 0 && <span className="ml-auto text-xs text-[#F8FAFC]/40">{Math.round((agent.wins / totalGames) * 100)}% WR</span>}
                    <span className="ml-2 font-['Orbitron'] text-xs text-[#E0E0E0]">ELO {agent.elo}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
