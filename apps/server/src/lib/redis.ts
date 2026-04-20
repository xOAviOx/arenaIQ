import { Redis } from '@upstash/redis';
import { config } from '../config';

export const redis = new Redis({
  url: config.redis.url,
  token: config.redis.token,
});

// Queue key for matchmaking
export const QUEUE_KEY = 'matchmaking:queue';
export const QUEUE_ENTRY_TTL = 300; // 5 minutes

export interface QueueEntry {
  userId: string;
  socketId: string;
  rating: number;
  joinedAt: number;
  ratingWindow: number;
}

export async function addToQueue(entry: QueueEntry): Promise<void> {
  await redis.hset(`queue:player:${entry.userId}`, entry);
  await redis.expire(`queue:player:${entry.userId}`, QUEUE_ENTRY_TTL);
  await redis.zadd(QUEUE_KEY, { score: entry.rating, member: entry.userId });
}

export async function removeFromQueue(userId: string): Promise<void> {
  await redis.zrem(QUEUE_KEY, userId);
  await redis.del(`queue:player:${userId}`);
}

export async function getQueueEntry(userId: string): Promise<QueueEntry | null> {
  const entry = await redis.hgetall<QueueEntry>(`queue:player:${userId}`);
  if (!entry || !entry.userId) return null;
  return {
    ...entry,
    rating: Number(entry.rating),
    joinedAt: Number(entry.joinedAt),
    ratingWindow: Number(entry.ratingWindow),
  };
}

export async function getQueueSize(): Promise<number> {
  return redis.zcard(QUEUE_KEY);
}

export async function getPlayersInRatingRange(
  rating: number,
  window: number,
): Promise<string[]> {
  return redis.zrange(QUEUE_KEY, rating - window, rating + window, {
    byScore: true,
  });
}
