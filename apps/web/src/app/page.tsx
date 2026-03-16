import Link from "next/link";

const features = [
  {
    title: "Mint AI Fighters",
    description: "Create unique agents with distinct archetypes and randomized stats. Each fighter is an NFT on Base.",
    icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  },
  {
    title: "Autonomous Battles",
    description: "Watch your agents fight using AI-driven strategies in real-time battle royale matches.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    title: "Win ETH Prizes",
    description: "Entry fees pool together. The last agent standing wins the pot. Higher ELO, bigger rewards.",
    icon: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4l3 3",
  },
  {
    title: "On Base Network",
    description: "Built on Base for low gas fees and fast transactions. Affordable minting and match entry.",
    icon: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM9 12l2 2 4-4",
  },
];

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

const steps = [
  { step: "01", title: "Connect Wallet", description: "Link your wallet on Base network. We support MetaMask and all major wallets." },
  { step: "02", title: "Mint Your Agent", description: "Choose an archetype, name your fighter, and mint for 0.002 ETH. Stats are randomly generated on-chain." },
  { step: "03", title: "Enter a Match", description: "Join a match lobby by paying the 0.001 ETH entry fee. Matches start when 8 agents are ready." },
  { step: "04", title: "Watch & Win", description: "Spectate the battle in real-time. Your AI fights autonomously. Last agent standing takes 90% of the prize pool." },
];

const faqs = [
  { q: "How does the AI decide what to do?", a: "Each agent uses a utility-based scoring system. It evaluates HP, energy, enemy proximity, zone pressure, and archetype strengths to pick the optimal action every tick. Intelligence stat reduces decision noise." },
  { q: "Are matches deterministic?", a: "Yes. Every match uses a seeded random number generator. Given the same seed and agents, the match plays out identically — enabling replay verification." },
  { q: "What happens to the entry fees?", a: "90% of the pooled entry fees go to the winner. 10% is the platform fee. All handled by the EntryPool smart contract on Base." },
  { q: "Can I control my agent during a match?", a: "No. Matches are fully autonomous — no human input during battles. Your agent's performance depends on its stats, archetype, and the AI engine." },
  { q: "What stats matter most?", a: "Strength scales damage, Agility determines action priority, Resilience increases max HP, and Intelligence improves decision quality. The best stat depends on your archetype." },
  { q: "How does the ELO system work?", a: "After each match, all agents' ratings update based on placements. Beating higher-rated agents earns more points. Starting ELO is 1200." },
];

const statLabels = ["STR", "AGI", "RES", "INT"];
const statKeys = ["strength", "agility", "resilience", "intelligence"] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 py-32 text-center overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: "radial-gradient(ellipse at center, #FFFFFF 0%, transparent 50%), radial-gradient(ellipse at 70% 50%, #FFFFFF 0%, transparent 50%)" }}
        />
        <h1 className="relative font-['Orbitron'] text-6xl font-bold tracking-tight sm:text-7xl md:text-8xl">
          <span className="text-[#FFFFFF]" style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>Agent</span>{" "}
          <span className="text-[#FFFFFF]" style={{ textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>Royale</span>
        </h1>
        <p className="relative mt-6 font-['Orbitron'] text-xl font-medium text-[#F8FAFC]/80 tracking-wider sm:text-2xl">
          Mint. Strategize. Spectate. Win.
        </p>
        <p className="relative mt-4 max-w-2xl text-lg text-[#F8FAFC]/50">
          The first fully autonomous AI battle royale on the blockchain. Mint unique AI fighters, enter them in matches, and watch them battle to the death for ETH prizes.
        </p>
        <div className="relative mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/mint" className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-[#FFFFFF] px-8 py-4 text-lg font-semibold text-black transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-lg shadow-[#FFFFFF]/25 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50">
            Mint Your Agent
          </Link>
          <Link href="/arena" className="cursor-pointer inline-flex items-center justify-center rounded-lg border-2 border-[#FFFFFF] px-8 py-4 text-lg font-semibold text-[#FFFFFF] transition-all duration-200 hover:bg-[#FFFFFF]/10 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50">
            Enter Arena
          </Link>
        </div>
      </section>

      {/* How It Works - Features */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center font-['Orbitron'] text-3xl font-bold text-[#F8FAFC]">How It Works</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="cursor-pointer rounded-xl bg-[#000000] p-6 transition-all duration-200 hover:-translate-y-0.5 border border-[#F8FAFC]/10 hover:border-[#FFFFFF]/40" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFFFFF]/15">
                  <svg className="h-6 w-6 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-['Orbitron'] text-base font-semibold text-[#F8FAFC]">{feature.title}</h3>
                <p className="text-sm text-[#F8FAFC]/50">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="border-t border-[#F8FAFC]/10 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-16 text-center font-['Orbitron'] text-3xl font-bold text-[#F8FAFC]">Get Started in 4 Steps</h2>
          <div className="space-y-8">
            {steps.map((s, i) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 flex h-14 w-14 items-center justify-center rounded-full border border-[#FFFFFF]/30 bg-[#FFFFFF]/5">
                  <span className="font-['Orbitron'] text-lg font-bold text-[#FFFFFF]" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>{s.step}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-['Orbitron'] text-lg font-semibold text-[#F8FAFC] mb-2">{s.title}</h3>
                  <p className="text-[#F8FAFC]/50 leading-relaxed">{s.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute ml-7 mt-16 h-8 w-px bg-[#FFFFFF]/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section className="border-t border-[#F8FAFC]/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center font-['Orbitron'] text-3xl font-bold text-[#F8FAFC]">Choose Your Fighter</h2>
          <p className="mb-16 text-center text-[#F8FAFC]/50 max-w-2xl mx-auto">
            Three distinct archetypes, each with a unique special ability. Your archetype shapes your agent&apos;s AI behavior in battle.
          </p>
          <div className="grid gap-8 lg:grid-cols-3">
            {archetypes.map((a) => (
              <div key={a.name} className="rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-6 transition-all duration-200 hover:border-[#FFFFFF]/30" style={{ boxShadow: "var(--shadow-md)" }}>
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FFFFFF]/10">
                    <svg className="h-7 w-7 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={a.icon} />
                    </svg>
                  </div>
                  <h3 className="font-['Orbitron'] text-xl font-bold text-[#FFFFFF]">{a.name}</h3>
                </div>
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
          </div>
        </div>
      </section>

      {/* Game Mechanics */}
      <section className="border-t border-[#F8FAFC]/10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center font-['Orbitron'] text-3xl font-bold text-[#F8FAFC]">Battle Mechanics</h2>
          <p className="mb-16 text-center text-[#F8FAFC]/50 max-w-2xl mx-auto">
            Every match is a 20x20 grid battle between up to 8 AI agents. Here&apos;s what happens inside the arena.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "5 Actions", desc: "Move (5 energy), Attack (15), Defend (10), Charge (+20), Special (30). Agents pick the highest-utility action each tick.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
              { title: "Shrinking Zone", desc: "The safe zone shrinks every 40 ticks. Agents outside take 10 damage per tick. Forces combat and prevents stalling.", icon: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" },
              { title: "200 Tick Limit", desc: "Matches last a maximum of 200 ticks. If multiple agents survive, the one with the most HP wins.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Utility AI", desc: "No scripted behavior. Each agent scores every possible action using archetype weights, HP urgency, energy, and enemy distance.", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
              { title: "ELO Rankings", desc: "Win matches to climb the leaderboard. Battle royale placements update ratings — beat higher-rated agents for bigger gains.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              { title: "On-Chain Settlement", desc: "Entry fees held in escrow by the EntryPool contract. Winner automatically receives 90% of the prize pool.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-5 transition-all duration-200 hover:border-[#FFFFFF]/20" style={{ boxShadow: "var(--shadow-sm)" }}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FFFFFF]/10">
                  <svg className="h-5 w-5 text-[#FFFFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <h3 className="mb-2 font-['Orbitron'] text-sm font-semibold text-[#F8FAFC]">{item.title}</h3>
                <p className="text-xs text-[#F8FAFC]/45 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-t border-[#F8FAFC]/10 px-6 py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-around gap-8 sm:flex-row">
          <div className="text-center">
            <div className="font-['Orbitron'] text-3xl font-bold text-[#FFFFFF]" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>10,000</div>
            <div className="mt-1 text-sm text-[#F8FAFC]/50">Max Agents</div>
          </div>
          <div className="text-center">
            <div className="font-['Orbitron'] text-3xl font-bold text-[#E0E0E0]" style={{ textShadow: "0 0 10px rgba(224,224,224,0.3)" }}>0.002 ETH</div>
            <div className="mt-1 text-sm text-[#F8FAFC]/50">Mint Price</div>
          </div>
          <div className="text-center">
            <div className="font-['Orbitron'] text-3xl font-bold text-[#FFFFFF]" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>8</div>
            <div className="mt-1 text-sm text-[#F8FAFC]/50">Agents Per Match</div>
          </div>
          <div className="text-center">
            <div className="font-['Orbitron'] text-3xl font-bold text-[#E0E0E0]" style={{ textShadow: "0 0 10px rgba(224,224,224,0.3)" }}>90%</div>
            <div className="mt-1 text-sm text-[#F8FAFC]/50">Winner Payout</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[#F8FAFC]/10 px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-16 text-center font-['Orbitron'] text-3xl font-bold text-[#F8FAFC]">FAQ</h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-xl border border-[#F8FAFC]/10 bg-[#000000] p-6" style={{ boxShadow: "var(--shadow-sm)" }}>
                <h3 className="font-['Orbitron'] text-sm font-semibold text-[#FFFFFF] mb-3">{faq.q}</h3>
                <p className="text-sm text-[#F8FAFC]/50 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[#F8FAFC]/10 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-['Orbitron'] text-4xl font-bold text-[#FFFFFF] mb-4" style={{ textShadow: "0 0 20px rgba(255,255,255,0.3)" }}>
            Ready to Fight?
          </h2>
          <p className="text-lg text-[#F8FAFC]/50 mb-10">
            Mint your AI agent, enter the arena, and let the battles begin. No skill required — your agent fights for you.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link href="/mint" className="cursor-pointer inline-flex items-center justify-center rounded-lg bg-[#FFFFFF] px-8 py-4 text-lg font-semibold text-black transition-all duration-200 hover:opacity-90 hover:-translate-y-px shadow-lg shadow-[#FFFFFF]/25 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50">
              Mint Your Agent
            </Link>
            <Link href="/arena" className="cursor-pointer inline-flex items-center justify-center rounded-lg border-2 border-[#FFFFFF] px-8 py-4 text-lg font-semibold text-[#FFFFFF] transition-all duration-200 hover:bg-[#FFFFFF]/10 hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/50">
              View Arena
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#F8FAFC]/10 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <span className="font-['Orbitron'] text-sm font-bold text-[#F8FAFC]/30">Agent Royale</span>
          <p className="text-xs text-[#F8FAFC]/20">Built on Base. Powered by AI. Settled on-chain.</p>
        </div>
      </footer>
    </div>
  );
}
