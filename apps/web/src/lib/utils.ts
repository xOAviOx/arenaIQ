import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RatingTier } from '@arenaiq/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTier(rating: number): RatingTier {
  if (rating >= 2400) return RatingTier.GRANDMASTER;
  if (rating >= 2000) return RatingTier.MASTER;
  if (rating >= 1600) return RatingTier.EXPERT;
  if (rating >= 1200) return RatingTier.SCHOLAR;
  if (rating >= 800) return RatingTier.APPRENTICE;
  return RatingTier.BEGINNER;
}

export const TIER_COLORS: Record<RatingTier, string> = {
  [RatingTier.GRANDMASTER]: 'text-yellow-400',
  [RatingTier.MASTER]: 'text-purple-400',
  [RatingTier.EXPERT]: 'text-blue-400',
  [RatingTier.SCHOLAR]: 'text-emerald-400',
  [RatingTier.APPRENTICE]: 'text-slate-300',
  [RatingTier.BEGINNER]: 'text-slate-400',
};

export const TIER_BG: Record<RatingTier, string> = {
  [RatingTier.GRANDMASTER]: 'bg-yellow-400/10 border-yellow-400/30',
  [RatingTier.MASTER]: 'bg-purple-400/10 border-purple-400/30',
  [RatingTier.EXPERT]: 'bg-blue-400/10 border-blue-400/30',
  [RatingTier.SCHOLAR]: 'bg-emerald-400/10 border-emerald-400/30',
  [RatingTier.APPRENTICE]: 'bg-slate-400/10 border-slate-400/30',
  [RatingTier.BEGINNER]: 'bg-slate-600/10 border-slate-600/30',
};

export function formatRatingDelta(delta: number): string {
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}
