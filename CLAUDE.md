# Agent Royale

Spectator-first battle royale where players mint AI fighter agents (ERC-721 NFTs on Base network), enter them into timed rounds, and watch as agents fight autonomously. No human input during matches. Winners take the prize pool.

## Architecture

- **Next.js 14** (apps/web) — frontend + API routes, React 18, Tailwind CSS, wagmi + ConnectKit for wallet
- **Battle Engine** (apps/engine) — standalone Express server, runs simulations, streams results via SSE
- **Smart Contracts** (packages/contracts) — Foundry, Solidity 0.8.24, AgentNFT (ERC-721) + EntryPool (escrow)
- **Shared Types** (packages/shared) — TypeScript enums, interfaces, constants shared across packages
- **Database** — PostgreSQL via Prisma (schema at apps/web/src/prisma/schema.prisma)
- **Monorepo** — npm workspaces + Turborepo

## Key Commands

```bash
# Install dependencies (from root)
npm install

# Build shared package (must be done first)
cd packages/shared && npx tsc

# Run engine tests (22 tests)
cd apps/engine && npx vitest run

# Type-check engine
cd apps/engine && npx tsc --noEmit

# Type-check web
cd apps/web && npx tsc --noEmit

# Build web app
cd apps/web && npx next build

# Dev servers
cd apps/web && npm run dev       # port 3000
cd apps/engine && npm run dev    # port 3001

# Contracts (requires forge install first)
cd packages/contracts && forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std
cd packages/contracts && forge build
cd packages/contracts && forge test -vvv
```

## Project Structure

```
apps/web/                         Next.js frontend + API routes
  src/app/page.tsx                Landing page
  src/app/mint/page.tsx           Mint flow (archetype select, name, pay 0.002 ETH)
  src/app/arena/page.tsx          Match lobby list
  src/app/arena/[matchId]/page.tsx  Live spectator view (canvas + event log)
  src/app/profile/page.tsx        User agents, match history
  src/app/api/                    API routes (matches CRUD, agents)
  src/components/arena/           BattleCanvas (600x600 HTML5 Canvas), EventLog
  src/components/layout/Header.tsx  Sticky nav with wallet connect
  src/components/providers.tsx    Wagmi + QueryClient + ConnectKit providers
  src/hooks/                      useMatchStream (SSE), useMintAgent, useAgentNFT
  src/lib/                        wagmi-config, contract ABIs, prisma client
  src/prisma/schema.prisma        Agent, Match, MatchEntry models

apps/engine/                      Battle simulation service
  src/simulation/match.ts         runMatch() — orchestrates full match
  src/simulation/tick.ts          processTick() — one tick of simulation
  src/simulation/agent-ai.ts      Utility-based AI decision engine + SeededRandom
  src/simulation/actions.ts       Move, Attack, Defend, Charge, Special executors
  src/simulation/zone.ts          Shrinking zone logic
  src/simulation/grid.ts          20x20 grid utilities
  src/sse/broker.ts               SSE pub-sub for tick streaming
  src/api/routes.ts               POST /matches/start, GET /matches/:id/stream (SSE), GET /matches/:id/result
  src/__tests__/simulation.test.ts  22 tests (all passing)

packages/contracts/
  src/AgentNFT.sol                ERC-721, 0.002 ETH mint, 10k supply, on-chain stats
  src/EntryPool.sol               Escrow, 0.001 ETH entry, 10% platform cut, owner-settled
  test/AgentNFT.t.sol             Foundry tests
  test/EntryPool.t.sol            Foundry tests

packages/shared/
  src/types.ts                    Archetype, ActionType, AgentState, TickEvent, MatchResult, etc.
  src/constants.ts                GRID_SIZE=20, MAX_TICKS=200, fees, energy costs, chain IDs
```

## Game Mechanics

- 20x20 grid, 8 agents per match, max 200 ticks
- 5 actions: Move (5 energy), Attack (15), Defend (10), Charge (+20 energy), Special (30)
- 3 archetypes: Brawler (AoE slam), Tactician (invisible trap), Survivor (self-heal)
- Shrinking zone every 40 ticks (10 dmg/tick outside zone)
- AI uses utility-based scoring: archetype weights + situational modifiers (HP urgency, enemy proximity, energy, zone pressure)
- Intelligence stat reduces decision noise, agility = action priority, strength = damage scaling, resilience = max HP
- Deterministic: seeded RNG enables replay from same seed

## Current Status

**Done:**
- Full monorepo setup with Turborepo
- Shared types package (builds clean)
- Battle engine with all simulation logic, AI, SSE streaming (22/22 tests pass)
- Smart contracts: AgentNFT.sol + EntryPool.sol with Foundry test suites
- Next.js frontend: all pages (landing, mint, arena, spectator, profile), components (BattleCanvas, EventLog, Header), hooks (useMatchStream, useMintAgent, useAgentNFT), wagmi/ConnectKit wallet integration, Prisma schema, API route stubs
- TypeScript compiles clean across all packages
- Next.js build succeeds

## What Needs To Be Done

### Immediate (to get it running end-to-end)
1. **Install Foundry deps** — `cd packages/contracts && forge install OpenZeppelin/openzeppelin-contracts foundry-rs/forge-std`, then `forge build` and `forge test`
2. **Deploy contracts to Base Sepolia** — write a deploy script in packages/contracts/script/, fund a deployer wallet with Sepolia ETH
3. **Set up PostgreSQL** — create database, set DATABASE_URL in .env, run `npx prisma db push`
4. **Configure .env** — copy .env.example, fill in: DATABASE_URL, NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (from cloud.walletconnect.com), contract addresses, NEXTAUTH_SECRET
5. **Wire API routes to real data** — replace placeholder JSON in apps/web/src/app/api/ with Prisma queries
6. **Connect match flow end-to-end** — create match in DB, call engine to start, settle on-chain via EntryPool

### Polish
7. **IPFS metadata** — upload agent images/JSON to Pinata or nft.storage, update tokenURI in AgentNFT
8. **SIWE auth** — implement Sign-In With Ethereum via next-auth for API route protection
9. **Match lobby logic** — auto-start when 8 agents join, verify NFT ownership before entry
10. **Elo rating system** — update agent Elo after each match in the database
11. **Error handling** — transaction failure UX, SSE reconnection, loading states

### Testing
12. **Foundry contract tests** — verify after installing deps
13. **Playwright e2e** — wallet connect flow, mint, spectator canvas renders
14. **Integration test on Base Sepolia** — full flow: mint agent, enter match, watch battle, winner gets payout

### Production
15. **Deploy contracts to Base mainnet**
16. **Deploy web to Vercel** — set env vars, connect domain
17. **Deploy engine to Railway/Fly.io** — persistent process for long-running matches
18. **Landing page polish** — better copy, animations, social proof

### Deferred (v2)
- Spectator betting (regulatory considerations)
- Agent learning/ML (replace utility AI with neural networks)
- 3D visuals (Three.js or similar)
- On-chain match verification (commit-reveal for determinism proofs)
- NFT marketplace UI
- Tournament brackets
