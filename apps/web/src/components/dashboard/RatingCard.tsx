'use client';

import { UserProfile } from '@arenaiq/types';
import { getTier, TIER_COLORS, TIER_BG, TIER_GLOW } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface RatingCardProps {
  profile: UserProfile;
}

const TIER_THRESHOLDS = [0, 800, 1200, 1600, 2000, 2400, 3000] as const;
const TIER_NAMES = ['Beginner', 'Apprentice', 'Scholar', 'Expert', 'Master', 'Grandmaster'] as const;

export function RatingCard({ profile }: RatingCardProps) {
  const tier = getTier(profile.rating);

  const currentTierIndex = TIER_NAMES.indexOf(tier as (typeof TIER_NAMES)[number]);
  const floorRating = TIER_THRESHOLDS[currentTierIndex] ?? 0;
  const ceilRating = TIER_THRESHOLDS[currentTierIndex + 1] ?? 3000;
  const progress = ((profile.rating - floorRating) / (ceilRating - floorRating)) * 100;
  const nextTier = TIER_NAMES[currentTierIndex + 1] ?? 'Max';

  return (
    <div className={cn('panel overflow-hidden p-6', TIER_GLOW[tier])}>
      {/* faint radial accent */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-[0.12] blur-2xl"
        style={{ background: 'radial-gradient(circle, currentColor, transparent 70%)' }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-arena-faint">
            Current Rating
          </p>
          <p className="mt-1.5 font-mono text-5xl font-bold tabular-nums text-arena-text">
            {profile.rating}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold uppercase tracking-wide',
            TIER_COLORS[tier],
            TIER_BG[tier],
          )}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {tier}
        </span>
      </div>

      <div className="relative mt-6">
        <div className="mb-2 flex justify-between font-mono text-xs text-arena-faint">
          <span>{floorRating}</span>
          <span className="text-arena-dim">→ {nextTier}</span>
          <span>{ceilRating}</span>
        </div>
        <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-arena-raised">
          <div
            className="relative h-full rounded-full bg-volt-grad transition-all duration-700 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 3), 100)}%` }}
          >
            <span className="sheen-layer" aria-hidden />
          </div>
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-1.5 font-mono text-xs text-arena-faint">
        <TrendingUp className="h-3.5 w-3.5 text-arena-volt" />
        <span>Deviation ±{Math.round(profile.ratingDeviation)}</span>
      </div>
    </div>
  );
}
