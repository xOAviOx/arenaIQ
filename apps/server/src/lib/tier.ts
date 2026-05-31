import { RatingTier } from '@arenaiq/types';

/** Map a Glicko-2 rating to its display tier (shared by matchmaking + rooms). */
export function getRatingTier(rating: number): RatingTier {
  if (rating >= 2400) return RatingTier.GRANDMASTER;
  if (rating >= 2000) return RatingTier.MASTER;
  if (rating >= 1600) return RatingTier.EXPERT;
  if (rating >= 1200) return RatingTier.SCHOLAR;
  if (rating >= 800) return RatingTier.APPRENTICE;
  return RatingTier.BEGINNER;
}
