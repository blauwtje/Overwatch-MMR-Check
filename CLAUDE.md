# owMMR

Overwatch 2 MMR estimator. Next.js 15 (App Router, Turbopack) + React 19 + TS 5 + Tailwind v4 + Base UI + shadcn. Server routes → OverFast API → in-memory LRU → per-role MMR algorithm.

## Map

- `app/api/player/[tag]/route.ts` → `lib/fetch-player.ts` (orchestrator, discriminated-union fan-out)
- `lib/overfast/client.ts` — 3 LRU caches (summary/stats max 500, career max 200), TTL `60 * 60 * 1000` literal (no named const). Exports `TrimmedCareer{Hero}`.
- `lib/overfast/transform.ts` — `extractRoleStats`, `attachHeroBreakdowns`
- `lib/overfast/career-transform.ts` — `extractHeroBreakdownByRole` (60s floor, top 10 per role)
- `lib/overfast/hero-role.ts` — `HERO_TO_ROLE satisfies Partial<Record<HeroKey, Role>>`
- `lib/algorithm/index.ts` — `ALGORITHM_VERSION`, `computeZScores`, `blendStats`, `blendHeroBreakdowns`, role MMR. **Source of truth.**
- `lib/algorithm/{types,peer-baselines,weights}.ts` — types + hand-curated baselines + `ROLE_WEIGHTS` (sums to 1.0 / role)
- `src/types/overfast.ts` — generated OpenAPI types (do not hand-edit)
- `components/mmr/{breakdown,role-card,share-card,verdict,…}.tsx` — UI; `share-card.tsx` is the screenshot artifact
- `components/mmr/hero-portrait.tsx` — client component, `<img>` with `onError` silhouette fallback; images live at `public/heroes/{hero-key}.webp`

## Conventions

- `lib/` is server-only — never add `"use client"` there
- Battle tags contain `#` → always `encodeURIComponent(playerId)`
- Cache key shape: `summary:{tag}` · `stats:{tag}:{platform}:{gamemode}` · `career:{tag}:{platform}:{gamemode}`
- `OverFastResult<T>` = `{ ok: true; data: T } | { ok: false; error }` — errors NOT cached
- Algorithm changes → bump `ALGORITHM_VERSION` (semver). Shared URLs are data snapshots; no migration needed
- Three caches stay separate (different payload sizes, isolate LRU pressure)

## Verification

- No test suite. Quality gate: `npx tsc --noEmit` (must exit 0, zero errors)
- Smoke test: `npm run dev` → `/api/player/{tag}?platform=pc&gamemode=competitive` → check `mmr.algorithmVersion`, `statsPartial`, role z-score keys

## Algorithm gotchas

- `sampleSizeWeight(gamesPlayed)` damps modifiers at ROLE level (K=200). `heroSampleWeight(gamesPlayed)` damps the top-3 weighted average inside `topHeroKda` (K=30, tighter because a hero is a narrower question than a role)
- `topHeroKda` activates only when `heroBreakdown.length >= 3 && top-3 share >= 0.8`; else plain `kda`
- Career fetch failure is **soft**: `statsPartial = true`, role falls back to v1.1.0 behavior. Never fatal
- All fetches go through one `Promise.all` (discriminated-union dispatch in `fetch-player.ts`) — don't reintroduce waterfalls
- Peer baselines exist only at anchor divisions; others interpolated

## Workflow

- Algorithm work: `superpowers:brainstorming` → `writing-plans` → `subagent-driven-development`
- UI work: `frontend-design` skill. Avoid generic AI aesthetics (no Inter, no purple gradients on white)
- Non-trivial features → git worktree under `.claude/worktrees/`
- Base branch: `main`

## Don't

- Don't add a `ONE_HOUR_MS` named constant — repo uses `60 * 60 * 1000` literal consistently
- Don't import from `lib/algorithm` into `lib/overfast` (one-way dependency only)
- Don't drop the `satisfies` constraint on `HERO_TO_ROLE` — it's the exhaustiveness check that catches new heroes at compile time
- Don't commit `.next/` artifacts (gitignore fix pending)
- Don't run `npm install` in a worktree — junction the main repo's `node_modules` instead (Windows: `New-Item -ItemType Junction`)

## New-hero workflow

When a new hero ships: (1) add them to `HERO_TO_ROLE` in `lib/overfast/hero-role.ts` (TypeScript will enforce this via `satisfies`); (2) add `public/heroes/{hero-key}.webp` (portrait artwork from Blizzard's CDN, ~5–15 KB). The `HeroPortrait` component falls back gracefully to a role-colored silhouette if the image is missing — layout never breaks.
