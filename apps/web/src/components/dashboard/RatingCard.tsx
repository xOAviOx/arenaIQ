'use client';

import { UserProfile } from '@arenaiq/types';
import { getTier, TIER_COLORS, TIER_BG } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

interface RatingCardProps {
  profile: UserProfile;
}

const TIER_THRESHOLDS = [0, 800, 1200, 1600, 2000, 2400, 3000] as const;
const TIER_NAMES = ['Beginner', 'Apprentice', 'Scholar', 'Expert', 'Master', 'Grandmaster'] as const;

export function RatingCard({ profile }: RatingCardProps) {
  const tier = getTier(profile.rating);

  const currentTierIndex = TIER_NAMES.indexOf(tier as typeof TIER_NAMES[number]);
  const floorRating = TIER_THRESHOLDS[currentTierIndex] ?? 0;
  const ceilRating = TIER_THRESHOLDS[currentTierIndex + 1] ?? 3000;
  const progress = ((profile.rating - floorRating) / (ceilRating - floorRating)) * 100;

  return (
    <div className="rounded-2xl border border-arena-border bg-arena-surface p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">Current Rating</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-white">{profile.rating}</p>
        </div>
        <span
          className={cn(
            'rounded-full border px-3 py-1 text-sm font-semibold',
            TIER_COLORS[tier],
            TIER_BG[tier],
          )}
        >
          {tier}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{floorRating}</span>
          <span className="text-slate-400">Progress to {TIER_NAMES[currentTierIndex + 1] ?? 'Max'}</span>
          <span>{ceilRating}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-arena-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-arena-accent to-arena-accent-light transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>RD: ±{Math.round(profile.ratingDeviation)}</span>
      </div>
    </div>
  );
}
