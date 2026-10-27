import { Redis } from 'ioredis';
import { env } from './env.js';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    redisInstance.on('error', (err) => {
      // Do not log connection strings or credentials
      console.error('[REDIS ERROR] Cache/queue connection error', err.message);
    });
  }
  return redisInstance;
}

export const redis = getRedisClient();
