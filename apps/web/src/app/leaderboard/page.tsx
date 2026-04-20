import { prisma } from '@arenaiq/db';
import { currentUser } from '@clerk/nextjs/server';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { LeaderboardEntry, Subject } from '@arenaiq/types';
import { getTier } from '@/lib/utils';
import Link from 'next/link';
import { Trophy, ArrowLeft } from 'lucide-react';

export default async function LeaderboardPage() {
  const clerkUser = await currentUser();
  const dbUser = clerkUser
    ? await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
    : null;

  const topUsers = await prisma.user.findMany({
    orderBy: { rating: 'desc' },
    take: 100,
  });

  const entries: LeaderboardEntry[] = topUsers.map((user, index) => ({
    rank: index + 1,
    user: {
      id: user.id,
      username: user.username,
      rating: user.rating,
      tier: getTier(user.rating),
      wins: user.wins,
      losses: user.losses,
    },
  }));

  return (
    <main className="min-h-screen bg-arena-bg">
      <div className="mx-auto max-w-3xl p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-arena-accent" />
            <h1 className="text-2xl font-bold text-white">Global Leaderboard</h1>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 rounded-xl border border-arena-border bg-arena-surface p-4">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">{topUsers.length}</span> ranked players
          </p>
        </div>

        <LeaderboardTable entries={entries} currentUserId={dbUser?.id} />
      </div>
    </main>
  );
}
