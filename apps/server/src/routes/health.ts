import { Router } from 'express';
import { redis } from '../lib/redis';
import { prisma } from '@arenaiq/db';

const router = Router();

router.get('/health', async (_req, res) => {
  try {
    await Promise.all([
      redis.ping(),
      prisma.$queryRaw`SELECT 1`,
    ]);
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', error: String(err) });
  }
});

export default router;
