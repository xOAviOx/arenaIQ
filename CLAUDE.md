# ArenaIQ

Competitive real-time 1v1 JEE/NEET math battle platform. Monorepo (npm workspaces + turbo).

## Layout
- `apps/web` — Next.js 14 (App Router) frontend, Tailwind, Clerk auth, Zustand, socket.io-client, KaTeX.
- `apps/server` — Express + ts-node-dev backend (port 4000), socket.io matchmaking, Prisma.
- `packages/db` — Prisma schema/client (`@arenaiq/db`). User model uses Glicko-2 ratings + Clerk integration.
- `packages/types` — shared types (`@arenaiq/types`).

## Run locally
- `npm run dev` (turbo) — starts web on **:3000** and server on **:4000**.
- Postgres runs in Docker container **`arenaiq-pg`** (postgres:16, maps 5432). If backend `/api/health`
  returns 503 or queries hang, the container is stopped → `docker start arenaiq-pg`.
- Redis is **Upstash** (REST). Token must be **read-write** or matchmaking queue enrollment fails.
- Backend health: `GET http://localhost:4000/api/health` → `{status:"ok"}` when DB + Redis are both up.
- Public routes (no auth): `/`, `/login`, `/register`, `/leaderboard`. Everything else is Clerk-protected
  and returns **404** when signed out (by design).

## Frontend design system — "Voltage Arena" (DO NOT regress to AI slop)
Deliberately distinctive. Never revert to generic dark-slate + purple `#7c3aed` + system-ui.

- **Theme**: deep ink base `#07080c`, panels `#0f111a`, raised `#161a26`, lines `#222739`.
- **Signature accent = volt-lime `#c8ff3d`** (brand/CTA/active). Dark text `#0b0d14` sits ON volt.
  Secondary: cyan `#39e0ff`. Ratings/victory: gold `#ffce4d`. Win `#2fe6a0`, lose `#ff5468`.
- **Fonts** (next/font in `layout.tsx`): **Syne** = display/headlines (`font-display`),
  **Hanken Grotesk** = body (`font-sans`), **JetBrains Mono** = ALL numbers/timers/ratings/labels (`font-mono`).
- **Tier colors** (`lib/utils.ts`): Beginner faint · Apprentice slate · Scholar cyan · Expert blue ·
  Master fuchsia · Grandmaster gold. Each has TIER_COLORS / TIER_BG / TIER_GLOW.
- **Atmosphere** (`globals.css`, mounted in `layout.tsx`): fixed `.arena-atmosphere` (radial volt/cyan glows)
  + `.arena-grid` (drifting graph-paper grid, math nod) + `.arena-grain` (film grain). Respects
  `prefers-reduced-motion`.
- **Reusable classes** (globals.css): `.panel` / `.panel-hover`, `.text-gradient-volt`,
  `.text-gradient-gold`, `.shimmer-text`, `.sheen-layer` (sweep), `.stagger` (entrance reveal — set
  inline `--i` index for delay), `.hairline`.
- **Tailwind tokens** (`tailwind.config.ts`): colors under `arena.*` (old `bg/surface/border/accent`
  aliases kept). Animations: `rise`, `pop-in`, `pulse-glow`, `float`, `grid-pan`, `shimmer`, `sheen`,
  `ping-slow`, `spin-slow`. Shadows: `shadow-volt`, `shadow-volt-sm`, `shadow-panel`, `shadow-glow`.
- **Shared components**: `components/shared/BrandMark.tsx` (glowing shard logo + wordmark),
  `TopBar.tsx` (sticky blurred nav). Use these for consistency.
- **Motion is CSS-only** (no framer-motion installed). Keep it that way unless adding the dep deliberately.

## Gotchas
- `react-katex` has no upstream types — shimmed in `apps/web/src/types/react-katex.d.ts`.
- Bash tool on Windows uses POSIX paths (`C:/...`); PowerShell for native Windows/docker/npm.
