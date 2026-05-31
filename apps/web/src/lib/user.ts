import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@arenaiq/db';
import { UserProfile } from '@arenaiq/types';

/**
 * Server-only helper. Resolves the signed-in Clerk user to our DB record,
 * lazily creating it on first sign-in, and returns both the raw record and a
 * serializable {@link UserProfile}. Returns null when nobody is signed in so
 * callers can redirect.
 */
export async function getOrCreateUserProfile() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  let dbUser = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });

  if (!dbUser) {
    const username =
      clerkUser.username ??
      clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] ??
      `player_${clerkUser.id.slice(-6)}`;

    dbUser = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        username,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
        rating: 1200,
        ratingDeviation: 350,
        volatility: 0.06,
      },
    });
  }

  const profile: UserProfile = {
    id: dbUser.id,
    username: dbUser.username,
    email: dbUser.email,
    rating: dbUser.rating,
    ratingDeviation: dbUser.ratingDeviation,
    volatility: dbUser.volatility,
    wins: dbUser.wins,
    losses: dbUser.losses,
    draws: dbUser.draws,
    createdAt: dbUser.createdAt,
  };

  return { dbUser, profile };
}
