import { Queue, Worker } from 'bullmq';
import { redisConnection, logger } from './config.js';
import { processDueReminders } from './jobs/reminderScheduler.js';
import { processSendPush } from './jobs/sendPush.js';
import { processSendEmail } from './jobs/sendEmail.js';
import { processMaintenance } from './jobs/cleanup.js';

logger.info('Initializing Daily Health Companion worker...');

// Queues
export const reminderQueue = new Queue('reminders', { connection: redisConnection });
export const notificationQueue = new Queue('notifications', { connection: redisConnection });

// BullMQ Worker to process dispatched jobs
const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    logger.info({ name: job.name, id: job.id }, 'Processing notification job');
    if (job.name === 'dispatch-push') {
      await processSendPush(job.data);
    } else if (job.name === 'dispatch-email') {
      await processSendEmail(job.data);
    }
  },
  { connection: redisConnection, concurrency: 5 }
);

notificationWorker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err: err.message }, 'Notification job failed');
});

// Periodic scheduler loops
let isShuttingDown = false;

async function runSchedulerLoop() {
  while (!isShuttingDown) {
    try {
      const dispatched = await processDueReminders(notificationQueue);
      if (dispatched > 0) {
        logger.info({ dispatched }, 'Processed due reminders');
      }
    } catch (err: any) {
      logger.error({ err: err.message }, 'Error in reminder scheduler cycle');
    }
    // Check every 60 seconds
    await new Promise((r) => setTimeout(r, 60000));
  }
}

async function runMaintenanceLoop() {
  while (!isShuttingDown) {
    try {
      await processMaintenance();
    } catch (err: any) {
      logger.error({ err: err.message }, 'Error in maintenance cycle');
    }
    // Run maintenance every 10 minutes
    await new Promise((r) => setTimeout(r, 600000));
  }
}

// Start loops
runSchedulerLoop();
runMaintenanceLoop();

logger.info('Worker scheduler and consumers started successfully');

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Stopping worker gracefully...');
  isShuttingDown = true;
  await notificationWorker.close();
  await reminderQueue.close();
  await notificationQueue.close();
  await redisConnection.quit();
  logger.info('Worker shutdown complete');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
