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
  [RatingTier.GRANDMASTER]: 'text-arena-gold',
  [RatingTier.MASTER]: 'text-fuchsia-400',
  [RatingTier.EXPERT]: 'text-arena-blue',
  [RatingTier.SCHOLAR]: 'text-arena-cyan',
  [RatingTier.APPRENTICE]: 'text-slate-300',
  [RatingTier.BEGINNER]: 'text-arena-faint',
};

export const TIER_BG: Record<RatingTier, string> = {
  [RatingTier.GRANDMASTER]: 'bg-arena-gold/10 border-arena-gold/30',
  [RatingTier.MASTER]: 'bg-fuchsia-400/10 border-fuchsia-400/30',
  [RatingTier.EXPERT]: 'bg-arena-blue/10 border-arena-blue/30',
  [RatingTier.SCHOLAR]: 'bg-arena-cyan/10 border-arena-cyan/30',
  [RatingTier.APPRENTICE]: 'bg-slate-300/10 border-slate-300/25',
  [RatingTier.BEGINNER]: 'bg-arena-faint/10 border-arena-faint/25',
};

export const TIER_GLOW: Record<RatingTier, string> = {
  [RatingTier.GRANDMASTER]: 'shadow-[0_0_30px_-8px_rgba(255,206,77,0.6)]',
  [RatingTier.MASTER]: 'shadow-[0_0_30px_-8px_rgba(232,121,249,0.55)]',
  [RatingTier.EXPERT]: 'shadow-[0_0_30px_-8px_rgba(91,140,255,0.55)]',
  [RatingTier.SCHOLAR]: 'shadow-[0_0_30px_-8px_rgba(57,224,255,0.5)]',
  [RatingTier.APPRENTICE]: 'shadow-[0_0_24px_-10px_rgba(203,213,225,0.4)]',
  [RatingTier.BEGINNER]: 'shadow-none',
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
