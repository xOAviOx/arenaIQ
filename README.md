# ArenaIQ — Competitive Math Battle Platform

Real-time 1v1 JEE/NEET math battles. Chess.com for competitive exam prep.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, shadcn/ui, Zustand, KaTeX |
| Backend | Node.js + Express + Socket.io |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Cache / Queue | Redis via Upstash |
| Auth | Clerk |
| Rating | Glicko-2 (custom implementation) |
| Monorepo | Turborepo |

## Monorepo Layout

```
arenaiq/
├── apps/
│   ├── web/          Next.js frontend
│   └── server/       Express + Socket.io backend
└── packages/
    ├── types/        Shared TypeScript types + Socket event maps
    └── db/           Prisma schema + client + seed script
```

## Prerequisites

- Node.js >= 20
- npm >= 10
- A [Supabase](https://supabase.com) project (PostgreSQL)
- An [Upstash](https://upstash.com) Redis database
- A [Clerk](https://clerk.com) application

## Local Development Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd arenaiq
npm install
```

### 2. Configure environment variables

Copy the root example and fill in your credentials:

```bash
cp .env.example .env
```

Also copy per-app examples:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example    apps/web/.env
```

Required variables:

```
# Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://[ID].upstash.io
UPSTASH_REDIS_REST_TOKEN=[TOKEN]

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Server
PORT=4000
CLIENT_URL=http://localhost:3000

# Frontend
NEXT_PUBLIC_SERVER_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### 3. Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Run migrations (creates all tables)
cd packages/db
npx prisma migrate dev --name init

# Seed 50 JEE/NEET questions
npm run db:seed
```

### 4. Start the development servers

```bash
# From the root — starts both frontend and backend in parallel
npm run dev
```

This runs:
- **Frontend** at `http://localhost:3000`
- **Backend** at `http://localhost:4000`

### 5. Verify

```bash
curl http://localhost:4000/api/health
# {"status":"ok","timestamp":"..."}
```

## Key Concepts

### Battle Flow

```
Player joins queue (join_queue)
  → Server matches within ±200 rating (expands +50 every 10s)
  → match_found emitted to both players
  → 5s countdown, then question_start (7 questions total)
  → Each question: 90s timer, first correct answer wins the round
  → After 7 questions: Glicko-2 delta calculated, match_end emitted
```

### Rating Tiers

| Rating | Tier |
|---|---|
| 0–800 | Beginner |
| 800–1200 | Apprentice |
| 1200–1600 | Scholar |
| 1600–2000 | Expert |
| 2000–2400 | Master |
| 2400+ | Grandmaster |

### Disconnection Handling

If a player disconnects mid-battle, the server:
1. Emits `opponent_left` to the remaining player
2. Waits **30 seconds** for reconnection
3. If no reconnect: the connected player wins by forfeit

### Socket Events

See `packages/types/src/socket.ts` for the full typed event map.

**Client → Server:** `join_queue`, `leave_queue`, `submit_answer`, `reconnect_battle`

**Server → Client:** `match_found`, `queue_status`, `question_start`, `answer_result`, `match_end`, `opponent_answered`, `opponent_left`, `opponent_reconnected`, `timer_sync`

## Deployment

### Frontend → Vercel

```bash
cd apps/web
vercel deploy
```

Set all `NEXT_PUBLIC_*` and `CLERK_*` env vars in the Vercel dashboard.

### Backend → Railway

Create a new Railway service pointing to `apps/server`.  
Set all server env vars (DATABASE_URL, UPSTASH_*, PORT, CLIENT_URL) in Railway settings.

Update `CLIENT_URL` on the server to your Vercel deployment URL.  
Update `NEXT_PUBLIC_WS_URL` on the frontend to your Railway URL.

## Admin Panel

Visit `/admin/questions` to browse the question bank.  
Use `POST /api/admin/questions` with a JSON body to add questions programmatically.

Question schema:
```json
{
  "latexQuestion": "The value of $\\int_0^1 x^2 dx$ is:",
  "options": ["$\\frac{1}{3}$", "$\\frac{1}{2}$", "$1$", "$2$"],
  "correctOption": 0,
  "subject": "MATHEMATICS",
  "topic": "Integration",
  "difficulty": "EASY",
  "year": 2023,
  "source": "JEE_MAINS",
  "explanation": "Optional explanation with LaTeX"
}
```
