import { prisma } from '@arenaiq/db';
import { currentUser } from '@clerk/nextjs/server';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { LeaderboardEntry, Subject } from '@arenaiq/types';
import { getTier } from '@/lib/utils';
import { TopBar } from '@/components/shared/TopBar';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

// Always render fresh so standings reflect the latest ratings.
export const dynamic = 'force-dynamic';

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
    <main className="min-h-screen">
      <TopBar>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-xl border border-arena-line px-3.5 py-2 text-sm text-arena-dim transition-colors hover:border-arena-volt/40 hover:text-arena-text"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </TopBar>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Header */}
        <div className="stagger" style={{ ['--i' as string]: 0 }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-arena-faint">
            Hall of Fame
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-arena-text">
            Global <span className="text-gradient-gold">Leaderboard</span>
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-arena-dim">
            <Users className="h-4 w-4 text-arena-faint" />
            <span className="font-mono font-semibold text-arena-text">{topUsers.length}</span>
            ranked challengers
          </p>
        </div>

        <div className="stagger mt-7" style={{ ['--i' as string]: 1 }}>
          <LeaderboardTable entries={entries} currentUserId={dbUser?.id} />
        </div>
      </div>
    </main>
  );
}
