# Pitchfork Protocol: Health Check and Cleanup

## What the app is today
- A wallet-based (Neo X) platform: hero/faucet, governance, ZK voting, decentralization dashboard, identity, messages, funding, whitepaper.
- Plus a large "consciousness / leadership / enterprise" AI section that was built for a separate Express server.

## Main problem
The published site only runs the frontend. Around 130 calls across the Consciousness, Enterprise Leadership, Leadership, AI Settings and Provider Health pages still point to the old Express server (`/api/...`, `localhost:3001`). In production those pages either fail or show empty/offline states. Only two cloud functions exist (AI status and Lovable AI).

The repo also carries lots of leftover material (Replit/Docker/Hardhat scripts, root test files, Drizzle DB config, audit markdown) that adds confusion.

## Recommended direction
1. **Focus the product** on the core: wallet + faucet, governance (dual governance, ZK voting, AI voting assistant), decentralization dashboard, organize/messages, funding, whitepaper.
2. **Hide or remove** the Express-dependent consciousness/enterprise/provider-health pages from navigation (keep code archived) instead of migrating ~60 endpoints.
3. **Rebuild AI features on Lovable AI** through the existing `lovable-ai` function: AI voting assistant proposal analysis and a single "AI insights" panel replacing the consciousness engines.
4. **Move persistent data to Lovable Cloud tables** (proposals metadata, organize campaigns, messages index) with sign-in-with-wallet ownership rules.
5. **Contracts**: confirm which are deployed on Neo X (47763), wire governance pages to real contract reads, and mark undeployed ones as "coming soon".
6. **Repo hygiene**: delete dead Replit/Docker/test scripts and stale docs; keep README, whitepaper, contracts.
7. **Verify**: click through every menu page on the published site at mobile size with no errors.

## Technical details
- Remove `server/` usage from `src/lib/queryClient.ts`, `consciousnessApi.ts`, `spacechildAuth.ts`, `TierContext.tsx`.
- Lazy routes in `App.tsx` and menu entries updated; sitemap/llms.txt pruned to match.
- New tables get RLS + grants; identity keyed by wallet address.

## Decision needed
Confirm step 2 (drop the consciousness/enterprise section) versus migrating it fully to cloud functions, which is a much larger effort.
