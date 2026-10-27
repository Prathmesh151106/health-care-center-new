import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './middleware/requestLogger.js';
import { prisma } from './config/db.js';
import { redis } from './config/redis.js';

const app = createApp();
const server = http.createServer(app);

const PORT = env.PORT;

server.listen(PORT, () => {
  logger.info({ port: PORT, env: env.NODE_ENV }, 'Daily Health Companion API started successfully');
});

// Graceful shutdown handling
let isShuttingDown = false;

async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info({ signal }, 'Graceful shutdown initiated. Closing HTTP server...');

  // 1. Stop accepting new HTTP requests
  server.close(async () => {
    logger.info('HTTP server closed. Draining database and cache connections...');
    try {
      await Promise.allSettled([
        prisma.$disconnect(),
        redis.quit()
      ]);
      logger.info('Resources drained successfully. Exiting process.');
      process.exit(0);
    } catch (err: any) {
      logger.error({ err }, 'Error during resource teardown');
      process.exit(1);
    }
  });

  // Forced shutdown after 10 seconds if graceful drain hangs
  setTimeout(() => {
    logger.error('Shutdown timed out after 10s. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled Promise Rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught Exception thrown');
  process.exit(1);
});
