import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, Mail, CalendarDays, Swords } from 'lucide-react';
import { RatingCard } from '@/components/dashboard/RatingCard';
import { StatsGrid } from '@/components/dashboard/StatsGrid';
import { TopBar } from '@/components/shared/TopBar';
import { getOrCreateUserProfile } from '@/lib/user';
import { getTier } from '@/lib/utils';

// Render fresh so rating/stats reflect the latest completed match.
export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const result = await getOrCreateUserProfile();
  if (!result) redirect('/login');

  const { profile } = result;
  const tier = getTier(profile.rating);
  const totalMatches = profile.wins + profile.losses + profile.draws;
  const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const facts = [
    { label: 'Email', value: profile.email || '—', icon: Mail },
    { label: 'Member since', value: memberSince, icon: CalendarDays },
    { label: 'Total matches', value: String(totalMatches), icon: Swords },
  ];

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
        <UserButton afterSignOutUrl="/" />
      </TopBar>

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <div className="stagger" style={{ ['--i' as string]: 0 }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-arena-faint">
            Fighter Profile
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-arena-text">
            <span className="text-gradient-volt">{profile.username}</span>
          </h1>
          <p className="mt-1.5 text-sm text-arena-dim">
            {tier} · {totalMatches} {totalMatches === 1 ? 'battle' : 'battles'} fought
          </p>
        </div>

        <div className="stagger" style={{ ['--i' as string]: 1 }}>
          <RatingCard profile={profile} />
        </div>

        <StatsGrid profile={profile} />

        <div className="panel stagger space-y-1 p-5" style={{ ['--i' as string]: 3 }}>
          {facts.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-4 border-b border-arena-line/60 py-3 last:border-0"
            >
              <span className="flex items-center gap-2.5 text-sm text-arena-dim">
                <Icon className="h-4 w-4 text-arena-faint" />
                {label}
              </span>
              <span className="truncate font-mono text-sm text-arena-text">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
