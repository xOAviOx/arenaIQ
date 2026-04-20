import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@arenaiq/db';
import { RatingCard } from '@/components/dashboard/RatingCard';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { FindMatchButton } from './FindMatchButton';
import { UserProfile } from '@arenaiq/types';
import Link from 'next/link';
import { Trophy, LayoutDashboard } from 'lucide-react';

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
    <main className="min-h-screen bg-arena-bg">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-arena-border px-6 py-4">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-arena-accent" />
          <span className="font-semibold text-white">Dashboard</span>
        </div>
        <Link href="/leaderboard" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Link>
      </nav>

      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-arena-accent-light">{profile.username}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">Ready for your next battle?</p>
        </div>

        <RatingCard profile={profile} />
        <StatsGrid profile={profile} />

        <FindMatchButton userId={dbUser.id} rating={dbUser.rating} />
      </div>
    </main>
  );
}
