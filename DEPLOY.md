# Deploying ArenaIQ for free

A complete, $0/month deployment with **every feature working** (realtime battles,
matchmaking, bot fallback, ratings, leaderboard, chat, resign).

## The stack

| Piece | Host | Free tier |
|---|---|---|
| Postgres | **Supabase** | 500 MB, unlimited API requests |
| Redis | **Upstash** | 10k commands/day (REST) |
| Auth | **Clerk** | 10k monthly active users |
| Frontend (Next.js) | **Vercel** (Hobby) | generous |
| Backend (Express + socket.io) | **Render** (Free web service) | 512 MB, sleeps when idle |

The backend is a **stateful WebSocket server** (in-memory match rooms + a matchmaking
loop), so it must run as one always-on process — not serverless. Render's free web
service fits, with one caveat (see *Known limits*).

---

## What's already done

The Supabase database is **already provisioned and seeded** (project `arenaiq`,
ref `dfcmsahkznnmaghxnbed`, region `us-west-1`):

- All tables created (matches the Prisma schema exactly).
- **45 JEE/NEET questions** loaded across Physics / Chemistry / Maths / Biology.
- Bot opponents are created automatically by the server on first boot — no seeding needed.

You only need the **connection strings** from it (Step 1).

---

## Step 1 — Get your Supabase connection strings

1. Open the **arenaiq** project in the [Supabase dashboard](https://supabase.com/dashboard).
2. **Project Settings → Database → Reset database password** → set a new password and copy it
   (the password was auto-generated at creation, so reset it to one you know).
3. Click **Connect** (top bar). You'll use two strings:

   - **`DATABASE_URL`** — the **Transaction pooler** string (host `...pooler.supabase.com`, port `6543`).
     Append `?pgbouncer=true`. Use this everywhere at runtime (safe for Vercel serverless):
     ```
     postgresql://postgres.dfcmsahkznnmaghxnbed:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
     ```
   - **`DIRECT_URL`** — the **Direct connection** string (host `db.dfcmsahkznnmaghxnbed.supabase.co`, port `5432`).
     Only used for schema changes:
     ```
     postgresql://postgres:YOUR_PASSWORD@db.dfcmsahkznnmaghxnbed.supabase.co:5432/postgres
     ```

> Copy the exact hosts from the dashboard's Connect dialog — they're the source of truth.

---

## Step 2 — Push the repo to GitHub

Render and Vercel both deploy from GitHub. Push this repo (the `master` branch is fine):

```bash
git remote add origin https://github.com/<you>/arenaiq.git   # if not already set
git push -u origin master
```

---

## Step 3 — Deploy the backend on Render

The repo already contains `render.yaml` (a Blueprint).

1. [Render dashboard](https://dashboard.render.com) → **New +** → **Blueprint**.
2. Connect your GitHub repo. Render reads `render.yaml` and proposes the **arenaiq-server** service.
3. Click **Apply**, then set the secret env vars (marked `sync: false`):

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Supabase **pooled** string from Step 1 |
   | `DIRECT_URL` | your Supabase **direct** string from Step 1 |
   | `UPSTASH_REDIS_REST_URL` | from your Upstash console |
   | `UPSTASH_REDIS_REST_TOKEN` | from Upstash (must be **read-write**) |
   | `CLIENT_URL` | your Vercel URL — fill after Step 4, e.g. `https://arenaiq.vercel.app` |

   (`NODE_ENV=production` is already in the blueprint; `PORT` is injected by Render.)

4. Deploy. When live, note the URL, e.g. `https://arenaiq-server.onrender.com`.
   Health check: open `https://arenaiq-server.onrender.com/api/health` → `{"status":"ok"}`.

---

## Step 4 — Deploy the frontend on Vercel

1. [Vercel](https://vercel.com/new) → **Import** your GitHub repo.
2. **Root Directory** → set to `apps/web`.
3. Framework preset: **Next.js** (auto-detected). Leave build/install commands default
   (Prisma client generates automatically via the `postinstall` hook).
4. Add **Environment Variables**:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Supabase **pooled** string (the web app's server components query Postgres directly) |
   | `DIRECT_URL` | Supabase **direct** string |
   | `NEXT_PUBLIC_WS_URL` | your Render backend URL, e.g. `https://arenaiq-server.onrender.com` |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | from Clerk (Step 5) |
   | `CLERK_SECRET_KEY` | from Clerk (Step 5) |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/login` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |

5. Deploy. Note the URL, e.g. `https://arenaiq.vercel.app`.

---

## Step 5 — Clerk (auth)

1. [Clerk dashboard](https://dashboard.clerk.com) → create an application (or reuse).
2. Copy the **Publishable key** and **Secret key** into Vercel env (Step 4).
3. Under **Domains / Allowed origins**, add your Vercel domain (`https://arenaiq.vercel.app`).
   For a custom domain, add a **Production instance**.
4. Set the same sign-in / after-sign-in URLs as the env vars above.

---

## Step 6 — Connect the two halves

The frontend and backend must point at each other:

1. In **Render**, set `CLIENT_URL` = your Vercel URL → triggers a redeploy (fixes socket CORS).
2. In **Vercel**, confirm `NEXT_PUBLIC_WS_URL` = your Render URL → redeploy if you changed it.

Then open your Vercel URL, sign up, and hit **Find Match**. Alone, you'll be paired with a
**bot** after ~8 seconds. Open a second browser/incognito with another account to battle a human.

---

## Known limits (and fixes)

- **Render free sleeps after ~15 min idle.** First request then takes ~50s to wake, and any
  match in progress at sleep time is lost (the server holds match state in memory).
  - *Acceptable* for a portfolio/demo.
  - *To keep it awake:* ping `/api/health` every ~10 min with a free cron
    (e.g. [cron-job.org](https://cron-job.org) or GitHub Actions). Stays within free limits.
- **Single instance only.** Matchmaking + match rooms live in memory, so do **not** scale the
  backend to >1 instance. Render free is single-instance, so you're fine by default.
- **Supabase pauses a project after ~1 week of inactivity** on free tier — just un-pause it
  from the dashboard if that happens.

## Environment variable reference

**Backend (Render):** `DATABASE_URL`, `DIRECT_URL`, `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`, `CLIENT_URL`, `NODE_ENV=production` (`PORT` auto).

**Frontend (Vercel):** `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_WS_URL`,
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
`NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`,
`NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`.
