import { prisma } from '@arenaiq/db';
import { calculateGlicko2 } from '../lib/glicko';
import { RatingChange } from '@arenaiq/types';

interface RatingUpdateResult {
  player1Change: RatingChange;
  player2Change: RatingChange;
  ratingDelta: number;
}

export async function updateRatings(
  matchId: string,
  player1Id: string,
  player2Id: string,
  winnerId: string | null,
): Promise<RatingUpdateResult> {
  const [p1, p2] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: player1Id } }),
    prisma.user.findUniqueOrThrow({ where: { id: player2Id } }),
  ]);

  const score1: 0 | 0.5 | 1 =
    winnerId === null ? 0.5 : winnerId === player1Id ? 1 : 0;
  const score2: 0 | 0.5 | 1 =
    winnerId === null ? 0.5 : winnerId === player2Id ? 1 : 0;

  const result1 = calculateGlicko2(
    { rating: p1.rating, rd: p1.ratingDeviation, vol: p1.volatility },
    { rating: p2.rating, rd: p2.ratingDeviation, vol: p2.volatility },
    score1,
  );

  const result2 = calculateGlicko2(
    { rating: p2.rating, rd: p2.ratingDeviation, vol: p2.volatility },
    { rating: p1.rating, rd: p1.ratingDeviation, vol: p1.volatility },
    score2,
  );

  await prisma.$transaction([
    prisma.user.update({
      where: { id: player1Id },
      data: {
        rating: result1.newRating,
        ratingDeviation: result1.newRd,
        volatility: result1.newVol,
        wins: winnerId === player1Id ? { increment: 1 } : undefined,
        losses: winnerId === player2Id ? { increment: 1 } : undefined,
        draws: winnerId === null ? { increment: 1 } : undefined,
      },
    }),
    prisma.user.update({
      where: { id: player2Id },
      data: {
        rating: result2.newRating,
        ratingDeviation: result2.newRd,
        volatility: result2.newVol,
        wins: winnerId === player2Id ? { increment: 1 } : undefined,
        losses: winnerId === player1Id ? { increment: 1 } : undefined,
        draws: winnerId === null ? { increment: 1 } : undefined,
      },
    }),
    prisma.match.update({
      where: { id: matchId },
      data: {
        ratingDelta: Math.abs(result1.delta),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    }),
  ]);

  return {
    player1Change: {
      before: p1.rating,
      after: result1.newRating,
      delta: result1.delta,
    },
    player2Change: {
      before: p2.rating,
      after: result2.newRating,
      delta: result2.delta,
    },
    ratingDelta: Math.abs(result1.delta),
  };
}
