import { prisma } from '@arenaiq/db';
import { Question } from '@arenaiq/types';
import { config } from '../config';

/**
 * Bot fallback opponents. A small pool of CPU "players" persisted as real User
 * rows (so matches + Glicko ratings work unchanged). Each bot sits at a
 * different rating so a lonely human gets paired with one near their own level.
 *
 * Bots are excluded from the public leaderboard (User.isBot).
 */

interface BotSeed {
  clerkId: string;
  username: string;
  rating: number;
}

const BOT_POOL: BotSeed[] = [
  { clerkId: 'bot_newton', username: 'Newton-VII', rating: 850 },
  { clerkId: 'bot_aryabhata', username: 'Aryabhata', rating: 1150 },
  { clerkId: 'bot_ramanujan', username: 'Ramanujan', rating: 1500 },
  { clerkId: 'bot_gauss', username: 'Gauss-9', rating: 1850 },
  { clerkId: 'bot_euler', username: 'Euler-X', rating: 2150 },
  { clerkId: 'bot_laplace', username: 'Laplace', rating: 2500 },
];

// Bots currently inside an active match — prevents the same bot being placed in
// two matches at once (which would race on its rating row).
const busyBots = new Set<string>();

/** Idempotently ensure the bot pool exists. Safe to call on every startup. */
export async function ensureBots(): Promise<void> {
  try {
    await Promise.all(
      BOT_POOL.map((bot) =>
        prisma.user.upsert({
          where: { clerkId: bot.clerkId },
          // Don't reset rating on restart — let bots drift like real players.
          update: { isBot: true },
          create: {
            clerkId: bot.clerkId,
            username: bot.username,
            email: `${bot.clerkId}@bot.arenaiq.local`,
            rating: bot.rating,
            ratingDeviation: 80, // confident rating → smaller swings vs humans
            volatility: 0.06,
            isBot: true,
          },
        }),
      ),
    );
    console.log(`Bot pool ready (${BOT_POOL.length} bots)`);
  } catch (err) {
    console.error('Failed to ensure bot pool:', err);
  }
}

export interface BotUser {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
}

/**
 * Reserve the free bot whose rating is closest to the human's, marking it busy.
 * Returns null when every bot is already in a match.
 */
export async function acquireBot(humanRating: number): Promise<BotUser | null> {
  const bots = await prisma.user.findMany({ where: { isBot: true } });
  const free = bots.filter((b) => !busyBots.has(b.id));
  if (free.length === 0) return null;

  free.sort(
    (a, b) => Math.abs(a.rating - humanRating) - Math.abs(b.rating - humanRating),
  );
  const chosen = free[0]!;
  busyBots.add(chosen.id);

  return {
    id: chosen.id,
    username: chosen.username,
    rating: chosen.rating,
    wins: chosen.wins,
    losses: chosen.losses,
  };
}

/** Release a bot back into the pool when its match ends. */
export function releaseBot(botId: string): void {
  busyBots.delete(botId);
}

/** Probability the bot answers a question correctly, by its rating + difficulty. */
function botAccuracy(botRating: number, difficulty: Question['difficulty']): number {
  // 1000 → ~0.45, 2200 → ~0.85
  let base = 0.45 + (botRating - 1000) / 3000;
  base = clamp(base, 0.4, 0.9);
  const mod = difficulty === 'EASY' ? 0.1 : difficulty === 'HARD' ? -0.12 : 0;
  return clamp(base + mod, 0.2, 0.95);
}

/** Pick the bot's answer index for a question (correct with accuracy probability). */
export function pickBotAnswer(question: Question, botRating: number): number {
  const accuracy = botAccuracy(botRating, question.difficulty);
  if (Math.random() < accuracy) return question.correctOption;

  const wrong = question.options
    .map((_, i) => i)
    .filter((i) => i !== question.correctOption);
  if (wrong.length === 0) return question.correctOption;
  return wrong[Math.floor(Math.random() * wrong.length)]!;
}

/** A human-like "thinking" delay before the bot locks in its answer (ms). */
export function botAnswerDelayMs(timeLimitSec: number): number {
  const ceiling = timeLimitSec * 1000 - 1500; // never let the timer beat the bot
  const min = config.bot.minAnswerDelayMs;
  const max = Math.max(min, Math.min(config.bot.maxAnswerDelayMs, ceiling));
  return Math.round(min + Math.random() * (max - min));
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
