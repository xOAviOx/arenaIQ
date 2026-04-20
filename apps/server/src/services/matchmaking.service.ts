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
import { createRoom, startBattle } from './battle.service';
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
    const queueSize = await getQueueSize();
    if (queueSize < 2) return;

    // Get all players sorted by rating
    const allPlayers = await redis.zrange(QUEUE_KEY, 0, -1);
    const matched = new Set<string>();

    for (const userId of allPlayers) {
      if (matched.has(userId)) continue;

      const entry = await getQueueEntry(userId);
      if (!entry) continue;

      const candidates = await getPlayersInRatingRange(entry.rating, entry.ratingWindow);
      const opponent = candidates.find(
        (c) => c !== userId && !matched.has(c),
      );

      if (!opponent) continue;

      const opponentEntry = await getQueueEntry(opponent);
      if (!opponentEntry) continue;

      matched.add(userId);
      matched.add(opponent);

      await Promise.all([removeFromQueue(userId), removeFromQueue(opponent)]);

      await createAndStartMatch(io, entry, opponentEntry);
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

  const roomId = await createRoom(
    io,
    {
      userId: p1User.id,
      socketId: p1Entry.socketId,
      username: p1User.username,
      rating: p1User.rating,
    },
    {
      userId: p2User.id,
      socketId: p2Entry.socketId,
      username: p2User.username,
      rating: p2User.rating,
    },
  );

  const p1Socket = io.sockets.sockets.get(p1Entry.socketId);
  const p2Socket = io.sockets.sockets.get(p2Entry.socketId);

  if (!p1Socket || !p2Socket) {
    console.warn('Socket(s) not found for match, aborting room:', roomId);
    return;
  }

  p1Socket.join(roomId);
  p2Socket.join(roomId);

  p1Socket.data.roomId = roomId;
  p2Socket.data.roomId = roomId;

  io.to(p1Entry.socketId).emit('match_found', {
    roomId,
    opponent: {
      id: p2User.id,
      username: p2User.username,
      rating: p2User.rating,
      tier: getRatingTier(p2User.rating),
      wins: p2User.wins,
      losses: p2User.losses,
    },
    startsIn: config.battle.matchStartDelay,
  });

  io.to(p2Entry.socketId).emit('match_found', {
    roomId,
    opponent: {
      id: p1User.id,
      username: p1User.username,
      rating: p1User.rating,
      tier: getRatingTier(p1User.rating),
      wins: p1User.wins,
      losses: p1User.losses,
    },
    startsIn: config.battle.matchStartDelay,
  });

  setTimeout(() => {
    startBattle(io, roomId);
  }, config.battle.matchStartDelay);
}

async function expandRatingWindows(): Promise<void> {
  const allPlayers = await redis.zrange(QUEUE_KEY, 0, -1);

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

function getRatingTier(rating: number) {
  if (rating >= 2400) return 'Grandmaster' as const;
  if (rating >= 2000) return 'Master' as const;
  if (rating >= 1600) return 'Expert' as const;
  if (rating >= 1200) return 'Scholar' as const;
  if (rating >= 800) return 'Apprentice' as const;
  return 'Beginner' as const;
}
