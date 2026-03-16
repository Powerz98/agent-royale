"use client";

import { useState, useEffect } from "react";
import { ConnectKitButton } from "connectkit";
import { useAccount, useReadContract } from "wagmi";
import { useMintAgent } from "@/hooks/useMintAgent";
import { AGENT_NFT_ADDRESS, agentNFTAbi } from "@/lib/contracts";
import { Archetype, ARCHETYPE_NAMES, MINT_PRICE, MAX_SUPPLY } from "@agent-royale/shared";

const archetypeCards = [
  { archetype: Archetype.Brawler, description: "Raw power, AoE damage", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
  { archetype: Archetype.Tactician, description: "Traps and strategy", icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" },
  { archetype: Archetype.Survivor, description: "Healing and endurance", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
];

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { mint, isPending, isConfirming, isConfirmed, hash, error } = useMintAgent();
  const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
  const [agentName, setAgentName] = useState("");
  const [registered, setRegistered] = useState(false);

  const { data: totalSupply, refetch: refetchSupply } = useReadContract({
    address: AGENT_NFT_ADDRESS as `0x${string}`,
    abi: agentNFTAbi,
    functionName: "totalSupply",
  });

  const handleMint = () => { if (selectedArchetype !== null) mint(selectedArchetype); };

  useEffect(() => {
    if (!isConfirmed || registered || !address || selectedArchetype === null) return;
    const registerAgent = async () => {
      const { data: newSupply } = await refetchSupply();
      const tokenId = newSupply ? Number(newSupply) : 1;
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenId, name: agentName || `Agent #${tokenId}`, archetype: selectedArchetype, owner: address }),
      });
      setRegistered(true);
    };
    registerAgent().catch(console.error);
  }, [isConfirmed, registered, address, selectedArchetype, agentName, refetchSupply]);

  const isLoading = isPending || isConfirming;

  if (!isConnected) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6">
        <div className="rounded-2xl border border-[#F8FAFC]/10 bg-[#000000] p-12 text-center" style={{ boxShadow: "var(--shadow-xl)" }}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FFFFFF]/15">
            <svg className="h-10 w-10 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
            </svg>
          </div>
          <h1 className="mb-3 font-['Orbitron'] text-4xl font-bold text-[#F8FAFC]">Mint Your Agent</h1>
          <p className="mb-8 text-lg text-[#F8FAFC]/50">Connect your wallet to mint an AI fighter</p>
          <ConnectKitButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-['Orbitron'] text-5xl font-bold text-[#F8FAFC]">Mint Your Agent</h1>
        <p className="mt-4 text-lg text-[#F8FAFC]/50">Choose an archetype and send your fighter into the arena</p>
        <p className="mt-2 text-sm text-[#F8FAFC]/30">{MINT_PRICE} ETH per mint &middot; {MAX_SUPPLY.toLocaleString()} max supply</p>
      </div>

      <section className="mb-10">
        <h2 className="mb-6 font-['Orbitron'] text-sm font-medium uppercase tracking-widest text-[#FFFFFF]">Select Archetype</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {archetypeCards.map((card) => {
            const isSelected = selectedArchetype === card.archetype;
            return (
              <button
                key={card.archetype}
                type="button"
                onClick={() => setSelectedArchetype(card.archetype)}
                className={`cursor-pointer group relative rounded-xl border-2 p-6 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#FFFFFF] bg-[#FFFFFF]/10"
                    : "border-[#F8FAFC]/10 bg-[#000000] hover:border-[#FFFFFF]/40"
                }`}
                style={{ boxShadow: isSelected ? "0 0 20px rgba(255,255,255,0.2)" : "var(--shadow-md)" }}
              >
                {isSelected && (
                  <div className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#FFFFFF] text-[#000000] text-xs font-bold shadow-lg">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                )}
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[#FFFFFF]/15">
                  <svg className="h-7 w-7 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                  </svg>
                </div>
                <h3 className="mb-1 font-['Orbitron'] text-lg font-semibold text-[#FFFFFF]">{ARCHETYPE_NAMES[card.archetype]}</h3>
                <p className="text-sm text-[#F8FAFC]/50">{card.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <label htmlFor="agent-name" className="mb-2 block font-['Orbitron'] text-sm font-medium uppercase tracking-widest text-[#FFFFFF]">
          Agent Name
        </label>
        <input
          id="agent-name"
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Enter a name for your fighter..."
          maxLength={24}
          className="w-full rounded-lg border border-[#F8FAFC]/15 bg-[#000000] px-4 py-3 text-[#F8FAFC] placeholder-[#F8FAFC]/30 outline-none transition-all duration-200 focus:border-[#FFFFFF] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.12)]"
        />
      </section>

      <button
        type="button"
        onClick={handleMint}
        disabled={selectedArchetype === null || isLoading}
        className="cursor-pointer w-full rounded-lg bg-[#FFFFFF] px-8 py-4 text-lg font-semibold text-black transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-lg shadow-[#FFFFFF]/25 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50"
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-3">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            {isPending ? "Confirm in wallet..." : "Confirming on-chain..."}
          </span>
        ) : (
          <span>Mint Agent &mdash; {MINT_PRICE} ETH</span>
        )}
      </button>

      {isConfirmed && hash && (
        <div className="mt-6 rounded-lg border border-[#FFFFFF]/30 bg-[#FFFFFF]/10 p-5 text-center">
          <p className="font-['Orbitron'] text-lg font-bold text-[#FFFFFF]">Agent minted successfully!</p>
          <p className="mt-2 text-sm text-[#F8FAFC]/50">Tx: <span className="font-mono">{hash.slice(0, 10)}...{hash.slice(-8)}</span></p>
          {registered && <p className="mt-2 text-sm text-[#F8FAFC]/50">Agent registered in the database</p>}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-center">
          <p className="font-bold text-red-400">Transaction failed</p>
          <p className="mt-2 text-sm text-[#F8FAFC]/50">{(error as Error).message?.slice(0, 120)}</p>
        </div>
      )}
    </div>
  );
}
