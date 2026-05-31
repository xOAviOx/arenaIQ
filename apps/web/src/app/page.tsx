import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { Swords, Zap, Trophy, Brain, ArrowRight } from 'lucide-react';
import { TopBar } from '@/components/shared/TopBar';

const FEATURES = [
  {
    icon: Swords,
    title: '1v1 Real-time Battles',
    desc: 'Server-authoritative duels. No cheating, no lag excuses — just you versus them.',
    accent: 'text-arena-volt',
  },
  {
    icon: Brain,
    title: 'JEE & NEET Arsenal',
    desc: 'Full LaTeX rendering across Physics, Chemistry, Maths and Biology.',
    accent: 'text-arena-cyan',
  },
  {
    icon: Zap,
    title: '90 Seconds. One Shot.',
    desc: 'First correct answer takes the round. Speed and accuracy both pay.',
    accent: 'text-arena-gold',
  },
  {
    icon: Trophy,
    title: 'Glicko-2 Ranked',
    desc: 'Honest matchmaking. Climb six tiers from Beginner to Grandmaster.',
    accent: 'text-arena-green',
  },
];

const TIERS = [
  { tier: 'Beginner', range: '0–800', color: 'text-arena-faint', ring: 'ring-arena-faint/30' },
  { tier: 'Apprentice', range: '800–1200', color: 'text-slate-300', ring: 'ring-slate-300/30' },
  { tier: 'Scholar', range: '1200–1600', color: 'text-arena-cyan', ring: 'ring-arena-cyan/40' },
  { tier: 'Expert', range: '1600–2000', color: 'text-arena-blue', ring: 'ring-arena-blue/40' },
  { tier: 'Master', range: '2000–2400', color: 'text-fuchsia-400', ring: 'ring-fuchsia-400/40' },
  { tier: 'Grandmaster', range: '2400+', color: 'text-arena-gold', ring: 'ring-arena-gold/50' },
];

const STATS = [
  { value: '90s', label: 'per question' },
  { value: '6', label: 'rating tiers' },
  { value: '1v1', label: 'live duels' },
  { value: '45+', label: 'curated problems' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <TopBar brandHref={null}>
        <SignedOut>
          <Link
            href="/login"
            className="rounded-xl border border-arena-line px-4 py-2 text-sm font-medium text-arena-dim transition-colors hover:border-arena-line-2 hover:text-arena-text"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-xl bg-arena-volt px-4 py-2 text-sm font-semibold text-[#0b0d14] shadow-volt-sm transition-transform hover:-translate-y-0.5"
          >
            Sign Up
          </Link>
        </SignedOut>
        <SignedIn>
          <Link
            href="/dashboard"
            className="rounded-xl bg-arena-volt px-4 py-2 text-sm font-semibold text-[#0b0d14] shadow-volt-sm transition-transform hover:-translate-y-0.5"
          >
            Dashboard
          </Link>
        </SignedIn>
      </TopBar>

      {/* Hero */}
      <section className="relative mx-auto max-w-5xl px-6 pb-20 pt-20 text-center sm:pt-28">
        <div
          className="stagger mb-7 inline-flex items-center gap-2 rounded-full border border-arena-volt/30 bg-arena-volt/[0.07] px-4 py-1.5 text-sm text-arena-accent-light"
          style={{ ['--i' as string]: 0 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-arena-volt opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-arena-volt" />
          </span>
          Competitive exam prep, turned blood sport
        </div>

        <h1
          className="stagger font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-arena-text sm:text-7xl"
          style={{ ['--i' as string]: 1 }}
        >
          The ranked arena
          <br />
          for <span className="text-gradient-volt">JEE &amp; NEET</span>
        </h1>

        <p
          className="stagger mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-arena-dim"
          style={{ ['--i' as string]: 2 }}
        >
          Real-time 1v1 problem duels. Solve faster than your opponent to steal the
          round. Ranked matches, Glicko-2 ratings, and a leaderboard that doesn&apos;t lie.
        </p>

        <div
          className="stagger mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          style={{ ['--i' as string]: 3 }}
        >
          <SignedOut>
            <Link
              href="/register"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-arena-volt px-8 py-4 text-base font-bold text-[#0b0d14] shadow-volt transition-transform hover:-translate-y-0.5"
            >
              <span className="sheen-layer" aria-hidden />
              Enter the Arena
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-arena-volt px-8 py-4 text-base font-bold text-[#0b0d14] shadow-volt transition-transform hover:-translate-y-0.5"
            >
              <span className="sheen-layer" aria-hidden />
              Find a Match
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </SignedIn>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 rounded-2xl border border-arena-line px-8 py-4 text-base font-semibold text-arena-text transition-colors hover:border-arena-volt/40 hover:bg-white/[0.02]"
          >
            <Trophy className="h-5 w-5 text-arena-gold" />
            Leaderboard
          </Link>
        </div>

        {/* Stat ticker */}
        <div
          className="stagger mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-arena-line bg-arena-line sm:grid-cols-4"
          style={{ ['--i' as string]: 4 }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="bg-arena-panel px-4 py-6">
              <div className="font-mono text-3xl font-bold text-arena-text">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-widest text-arena-faint">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, desc, accent }, i) => (
            <div
              key={title}
              className="panel panel-hover stagger p-6"
              style={{ ['--i' as string]: i }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-arena-line bg-arena-raised">
                <Icon className={`h-5 w-5 ${accent}`} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-arena-text">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-arena-dim">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="relative border-t border-arena-line/70 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-arena-faint">
            The Climb
          </p>
          <h2 className="mt-3 text-center font-display text-3xl font-bold text-arena-text">
            Six tiers. One ladder.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {TIERS.map(({ tier, range, color, ring }, i) => (
              <div
                key={tier}
                className={`stagger flex flex-col items-center gap-1 rounded-2xl bg-arena-panel px-6 py-4 ring-1 ${ring}`}
                style={{ ['--i' as string]: i }}
              >
                <span className={`font-display font-bold ${color}`}>{tier}</span>
                <span className="font-mono text-xs text-arena-faint">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-arena-line/70 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <BrandMarkFooter />
          <p className="font-mono text-xs text-arena-faint">Solve. Climb. Dominate.</p>
        </div>
      </footer>
    </main>
  );
}

function BrandMarkFooter() {
  return (
    <span className="flex items-center gap-2 text-sm text-arena-dim">
      <span className="h-1.5 w-1.5 rounded-full bg-arena-volt" />
      ArenaIQ
    </span>
  );
}
