"use client";

import { AnimatedCardGroup } from "@/components/ui/animated-card";

const archetypes = [
  {
    name: "Brawler",
    description: "Raw power and AoE devastation. Brawlers charge into the fray with a massive slam that damages all nearby enemies. High strength, low subtlety.",
    special: "Ground Slam",
    specialDesc: "Deals 3x strength damage to all agents within 2 tiles",
    stats: { strength: 9, agility: 4, resilience: 6, intelligence: 3 },
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    name: "Tactician",
    description: "Masters of deception and battlefield control. Tacticians place invisible traps that punish careless enemies. The thinking fighter's choice.",
    special: "Invisible Trap",
    specialDesc: "Places a hidden trap dealing 2x strength damage when triggered",
    stats: { strength: 4, agility: 7, resilience: 3, intelligence: 9 },
    icon: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
  },
  {
    name: "Survivor",
    description: "Outlast everyone. Survivors heal themselves mid-battle, turning long fights into their advantage. The last one standing wins.",
    special: "Self Heal",
    specialDesc: "Restores 3x resilience HP instantly",
    stats: { strength: 3, agility: 5, resilience: 9, intelligence: 5 },
    icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  },
];

const statLabels = ["STR", "AGI", "RES", "INT"];
const statKeys = ["strength", "agility", "resilience", "intelligence"] as const;

export function ArchetypeCards() {
  return (
    <AnimatedCardGroup>
      {archetypes.map((a) => (
        <div key={a.name}>
          {/* Icon + Name */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FFFFFF]/10">
              <svg className="h-7 w-7 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
              </svg>
            </div>
            <h3 className="font-['Orbitron'] text-xl font-bold text-[#FFFFFF]">{a.name}</h3>
          </div>

          {/* Description */}
          <p className="text-sm text-[#F8FAFC]/50 leading-relaxed mb-5">{a.description}</p>

          {/* Special Ability */}
          <div className="rounded-lg border border-[#FFFFFF]/10 bg-[#FFFFFF]/5 p-4 mb-5">
            <p className="font-['Orbitron'] text-xs font-medium uppercase tracking-widest text-[#FFFFFF]/60 mb-1">Special Ability</p>
            <p className="font-semibold text-[#FFFFFF] text-sm">{a.special}</p>
            <p className="text-xs text-[#F8FAFC]/40 mt-1">{a.specialDesc}</p>
          </div>

          {/* Stat Bars */}
          <div className="space-y-2">
            {statKeys.map((key, i) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-8 text-xs font-bold text-[#F8FAFC]/40">{statLabels[i]}</span>
                <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#F8FAFC]/10">
                  <div className="absolute inset-y-0 left-0 rounded-full bg-[#FFFFFF] transition-all duration-300" style={{ width: `${a.stats[key] * 10}%` }} />
                </div>
                <span className="w-6 text-right text-xs font-bold text-[#F8FAFC]/40">{a.stats[key]}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </AnimatedCardGroup>
  );
}
