import { Redis } from 'ioredis';
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['user.email', 'password', 'token', 'authorization']
});

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

redisConnection.on('error', (err) => {
  logger.error({ err: err.message }, 'Redis connection error in worker');
});
