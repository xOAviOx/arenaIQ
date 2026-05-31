import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { prisma } from '@arenaiq/db';
import { RatingCard } from '@/components/dashboard/RatingCard';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { FindMatchButton } from './FindMatchButton';
import { TopBar } from '@/components/shared/TopBar';
import { UserProfile } from '@arenaiq/types';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

// Always render fresh so rating/stats reflect the latest completed match.
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/login');

  let dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });

  if (!dbUser) {
    const username =
      clerkUser.username ??
      clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ??
      `player_${clerkUser.id.slice(-6)}`;

    dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        username,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        rating: 1200,
        ratingDeviation: 350,
        volatility: 0.06,
      },
    });
  }

  const profile: UserProfile = {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    rating: dbUser.rating,
    ratingDeviation: dbUser.ratingDeviation,
    volatility: dbUser.volatility,
    wins: dbUser.wins,
    losses: dbUser.losses,
    draws: dbUser.draws,
    createdAt: dbUser.createdAt,
  };

  return (
    <main className="min-h-screen">
      <TopBar>
        <Link
          href="/leaderboard"
          className="flex items-center gap-1.5 rounded-xl border border-arena-line px-3.5 py-2 text-sm text-arena-dim transition-colors hover:border-arena-volt/40 hover:text-arena-text"
        >
          <Trophy className="h-4 w-4 text-arena-gold" />
          <span className="hidden sm:inline">Leaderboard</span>
        </Link>
        <UserButton afterSignOutUrl="/" />
      </TopBar>

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <div className="stagger" style={{ ['--i' as string]: 0 }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-arena-faint">
            Command Center
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-arena-text">
            Welcome back, <span className="text-gradient-volt">{profile.username}</span>
          </h1>
          <p className="mt-1.5 text-sm text-arena-dim">Your opponents are warming up. Are you?</p>
        </div>

        <div className="stagger" style={{ ['--i' as string]: 1 }}>
          <RatingCard profile={profile} />
        </div>

        <StatsGrid profile={profile} />

        <div className="stagger" style={{ ['--i' as string]: 2 }}>
          <FindMatchButton userId={dbUser.id} rating={dbUser.rating} />
        </div>
      </div>
    </main>
  );
}
