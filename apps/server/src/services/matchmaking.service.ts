import { Server } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@arenaiq/types';
import {
  redis,
  QUEUE_KEY,
  addToQueue,
  removeFromQueue,
  getQueueEntry,
  getQueueSize,
  getPlayersInRatingRange,
  QueueEntry,
} from '../lib/redis';
import { launchMatch } from './battle.service';
import { acquireBot, releaseBot, BotUser } from './bot.service';
import { prisma } from '@arenaiq/db';
import { config } from '../config';

type IoType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

let pollInterval: NodeJS.Timeout | null = null;
let expansionInterval: NodeJS.Timeout | null = null;

export function startMatchmaking(io: IoType): void {
  if (pollInterval) return;

  pollInterval = setInterval(() => {
    void runMatchmakingCycle(io);
  }, config.matchmaking.pollIntervalMs);

  expansionInterval = setInterval(() => {
    void expandRatingWindows();
  }, config.matchmaking.windowExpansionIntervalMs);

  console.log('Matchmaking service started');
}

export function stopMatchmaking(): void {
  if (pollInterval) clearInterval(pollInterval);
  if (expansionInterval) clearInterval(expansionInterval);
  pollInterval = null;
  expansionInterval = null;
}

export async function enqueuePlayer(
  io: IoType,
  entry: QueueEntry,
): Promise<void> {
  await addToQueue(entry);
  const queueSize = await getQueueSize();

  io.to(entry.socketId).emit('queue_status', {
    position: queueSize,
    estimatedWait: Math.ceil(queueSize * 5),
    playersOnline: queueSize,
  });
}

export async function dequeuePlayer(userId: string): Promise<void> {
  await removeFromQueue(userId);
}

async function runMatchmakingCycle(io: IoType): Promise<void> {
  try {
    // Players sorted by rating (this queue only ever holds humans).
    const allPlayers = await redis.zrange<string[]>(QUEUE_KEY, 0, -1);
    if (allPlayers.length === 0) return;

    const matched = new Set<string>();

    // ── Pass 1: human vs human ──────────────────────────────────
    if (allPlayers.length >= 2) {
      for (const userId of allPlayers) {
        if (matched.has(userId)) continue;

        const entry = await getQueueEntry(userId);
        if (!entry) continue;

        const candidates = await getPlayersInRatingRange(entry.rating, entry.ratingWindow);
        const opponent = candidates.find((c) => c !== userId && !matched.has(c));

        if (!opponent) continue;

        const opponentEntry = await getQueueEntry(opponent);
        if (!opponentEntry) continue;

        matched.add(userId);
        matched.add(opponent);

        await Promise.all([removeFromQueue(userId), removeFromQueue(opponent)]);

        await createAndStartMatch(io, entry, opponentEntry);
      }
    }

    // ── Pass 2: bot fallback for lonely, long-waiting humans ────
    if (!config.bot.enabled) return;
    const now = Date.now();

    for (const userId of allPlayers) {
      if (matched.has(userId)) continue;

      const entry = await getQueueEntry(userId);
      if (!entry) continue;
      if (now - entry.joinedAt < config.bot.fallbackMs) continue;

      const bot = await acquireBot(entry.rating);
      if (!bot) continue; // every bot busy — retry next cycle

      matched.add(userId);
      await removeFromQueue(userId);

      await createAndStartBotMatch(io, entry, bot);
    }
  } catch (err) {
    console.error('Matchmaking cycle error:', err);
  }
}

async function createAndStartMatch(
  io: IoType,
  p1Entry: QueueEntry,
  p2Entry: QueueEntry,
): Promise<void> {
  const [p1User, p2User] = await Promise.all([
    prisma.user.findUnique({ where: { id: p1Entry.userId } }),
    prisma.user.findUnique({ where: { id: p2Entry.userId } }),
  ]);

  if (!p1User || !p2User) return;

  await launchMatch(
    io,
    {
      userId: p1User.id,
      socketId: p1Entry.socketId,
      username: p1User.username,
      rating: p1User.rating,
      wins: p1User.wins,
      losses: p1User.losses,
    },
    {
      userId: p2User.id,
      socketId: p2Entry.socketId,
      username: p2User.username,
      rating: p2User.rating,
      wins: p2User.wins,
      losses: p2User.losses,
    },
  );
}

async function createAndStartBotMatch(
  io: IoType,
  humanEntry: QueueEntry,
  bot: BotUser,
): Promise<void> {
  const human = await prisma.user.findUnique({ where: { id: humanEntry.userId } });
  if (!human) {
    releaseBot(bot.id);
    return;
  }

  // launchMatch frees the bot (via onEnd) if the human's socket has vanished,
  // and again when the match ends — so the bot is always released exactly once.
  await launchMatch(
    io,
    {
      userId: human.id,
      socketId: humanEntry.socketId,
      username: human.username,
      rating: human.rating,
      wins: human.wins,
      losses: human.losses,
    },
    {
      // Bot has no socket — a sentinel id keeps emits to it harmless no-ops.
      userId: bot.id,
      socketId: `bot:${bot.id}`,
      username: bot.username,
      rating: bot.rating,
      wins: bot.wins,
      losses: bot.losses,
    },
    {
      bot: { userId: bot.id, rating: bot.rating },
      onEnd: () => releaseBot(bot.id),
    },
  );
}

async function expandRatingWindows(): Promise<void> {
  const allPlayers = await redis.zrange<string[]>(QUEUE_KEY, 0, -1);

  for (const userId of allPlayers) {
    const entry = await getQueueEntry(userId);
    if (!entry) continue;

    const newWindow =
      entry.ratingWindow + config.matchmaking.windowExpansionPerStep;

    await redis.hset(`queue:player:${userId}`, {
      ...entry,
      ratingWindow: newWindow,
    });
  }
}
