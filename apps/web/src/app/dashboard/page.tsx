import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { FindMatchButton } from './FindMatchButton';
import { TopBar } from '@/components/shared/TopBar';
import { getOrCreateUserProfile } from '@/lib/user';
import { getTier, TIER_COLORS } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Trophy, UserRound } from 'lucide-react';

// Always render fresh so rating/stats reflect the latest completed match.
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const result = await getOrCreateUserProfile();
  if (!result) redirect('/login');

  const { dbUser, profile } = result;
  const tier = getTier(profile.rating);

  return (
    <main className="min-h-screen">
      <TopBar>
        <Link
          href="/profile"
          className="flex items-center gap-1.5 rounded-xl border border-arena-line px-3.5 py-2 text-sm text-arena-dim transition-colors hover:border-arena-volt/40 hover:text-arena-text"
        >
          <UserRound className="h-4 w-4 text-arena-volt" />
          <span className="hidden sm:inline">Profile</span>
        </Link>
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

        {/* Quick rating glance — full breakdown lives on the profile page. */}
        <Link
          href="/profile"
          className="panel panel-hover stagger flex items-center justify-between gap-4 p-5"
          style={{ ['--i' as string]: 1 }}
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-arena-faint">
              Current Rating
            </p>
            <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-arena-text">
              {profile.rating}
            </p>
          </div>
          <div className="text-right">
            <p className={cn('font-bold uppercase tracking-wide', TIER_COLORS[tier])}>{tier}</p>
            <p className="mt-1 font-mono text-xs text-arena-faint">View full profile →</p>
          </div>
        </Link>

        <div className="stagger" style={{ ['--i' as string]: 2 }}>
          <FindMatchButton userId={dbUser.id} rating={dbUser.rating} />
        </div>
      </div>
    </main>
  );
}
