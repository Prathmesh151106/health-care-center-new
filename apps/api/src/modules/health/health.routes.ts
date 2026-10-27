import { Router, Request, Response } from 'express';
import { prisma } from '../../config/db.js';
import { redis } from '../../config/redis.js';

export const healthRoutes = Router();

/**
 * GET /api/health
 * Liveness probe: returns 200 if the process is responsive.
 */
healthRoutes.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/health/ready
 * Readiness probe: checks PostgreSQL and Redis connection within bounded timeout.
 */
healthRoutes.get('/ready', async (_req: Request, res: Response) => {
  const checks: { database: boolean; redis: boolean } = {
    database: false,
    redis: false
  };

  try {
    // 1. Check DB with 2s timeout
    const dbPromise = prisma.$queryRaw`SELECT 1`;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB Timeout')), 2000)
    );
    await Promise.race([dbPromise, timeoutPromise]);
    checks.database = true;
  } catch (err: any) {
    checks.database = false;
  }

  try {
    // 2. Check Redis with 2s timeout
    const pingPromise = redis.ping();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Redis Timeout')), 2000)
    );
    const result = await Promise.race([pingPromise, timeoutPromise]);
    checks.redis = result === 'PONG';
  } catch (err: any) {
    checks.redis = false;
  }

  const isReady = checks.database && checks.redis;
  res.status(isReady ? 200 : 503).json({
    status: isReady ? 'ready' : 'unready',
    checks,
    timestamp: new Date().toISOString()
  });
});
