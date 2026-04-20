import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Swords, Zap, Trophy, Brain } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Swords,
      title: '1v1 Real-time Battles',
      desc: 'Challenge opponents instantly with server-authoritative game logic.',
    },
    {
      icon: Brain,
      title: 'JEE & NEET Questions',
      desc: 'Full LaTeX rendering for Physics, Chemistry, Maths, and Biology.',
    },
    {
      icon: Zap,
      title: '90s Per Question',
      desc: 'First correct answer wins the round. Speed and accuracy both matter.',
    },
    {
      icon: Trophy,
      title: 'Glicko-2 Ratings',
      desc: 'Fair matchmaking. Six tiers from Beginner to Grandmaster.',
    },
  ];

  return (
    <main className="min-h-screen bg-arena-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-arena-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Swords className="h-6 w-6 text-arena-accent" />
          <span className="text-lg font-bold text-white">ArenaIQ</span>
        </div>
        <div className="flex items-center gap-3">
          <SignedOut>
            <Link
              href="/login"
              className="rounded-lg border border-arena-border px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-arena-surface"
            >
              Sign In
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-lg bg-arena-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-arena-accent/80"
            >
              Dashboard
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center rounded-full border border-arena-accent/30 bg-arena-accent/10 px-4 py-1.5 text-sm text-arena-accent-light">
          Competitive exam prep, gamified
        </div>
        <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
          Chess.com
          <br />
          <span className="bg-gradient-to-r from-arena-accent to-arena-accent-light bg-clip-text text-transparent">
            for JEE/NEET
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
          Real-time 1v1 math battles. Solve faster than your opponent to win the round.
          Ranked matches, Glicko-2 ratings, and 50+ curated questions.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <SignedOut>
            <Link
              href="/login"
              className="rounded-xl bg-arena-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-arena-accent/30 transition-all hover:bg-arena-accent/80 hover:shadow-arena-accent/50"
            >
              Start Playing Free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl bg-arena-accent px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-arena-accent/30 transition-all hover:bg-arena-accent/80"
            >
              Find a Match
            </Link>
          </SignedIn>
          <Link
            href="/leaderboard"
            className="rounded-xl border border-arena-border px-8 py-3.5 text-base font-semibold text-slate-300 transition-colors hover:bg-arena-surface"
          >
            Leaderboard
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-arena-border bg-arena-surface p-6 transition-colors hover:border-arena-accent/30"
            >
              <Icon className="h-6 w-6 text-arena-accent-light" />
              <h3 className="mt-3 font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-arena-border py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-8 text-center text-2xl font-bold text-white">Rating Tiers</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { tier: 'Beginner', range: '0–800', color: 'text-slate-400' },
              { tier: 'Apprentice', range: '800–1200', color: 'text-slate-300' },
              { tier: 'Scholar', range: '1200–1600', color: 'text-emerald-400' },
              { tier: 'Expert', range: '1600–2000', color: 'text-blue-400' },
              { tier: 'Master', range: '2000–2400', color: 'text-purple-400' },
              { tier: 'Grandmaster', range: '2400+', color: 'text-yellow-400' },
            ].map(({ tier, range, color }) => (
              <div
                key={tier}
                className="flex flex-col items-center gap-1 rounded-xl border border-arena-border bg-arena-surface px-5 py-3"
              >
                <span className={`font-semibold ${color}`}>{tier}</span>
                <span className="text-xs text-slate-500">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
