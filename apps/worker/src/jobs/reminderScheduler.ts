import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import { rrulestr } from 'rrule';
import { logger } from '../config.js';
import { MedicineStatus } from '@health-care-center/shared';

const prisma = new PrismaClient();

export async function processDueReminders(reminderQueue: Queue): Promise<number> {
  const now = new Date();

  // Find due active reminders
  const dueReminders = await prisma.reminder.findMany({
    where: {
      isActive: true,
      nextFireAt: { lte: now }
    },
    take: 50,
    include: {
      user: {
        select: { id: true, email: true, timezone: true }
      },
      medicine: {
        select: { id: true, name: true, dose: true }
      }
    }
  });

  let dispatchedCount = 0;

  for (const reminder of dueReminders) {
    try {
      // 1. If linked to medicine, create a PENDING medicine event idempotently
      if (reminder.medicineId) {
        await prisma.medicineEvent.upsert({
          where: {
            unique_medicine_scheduled_event: {
              medicineId: reminder.medicineId,
              scheduledAt: reminder.nextFireAt
            }
          },
          create: {
            medicineId: reminder.medicineId,
            scheduledAt: reminder.nextFireAt,
            status: MedicineStatus.PENDING
          },
          update: {} // Idempotent no-op if already present
        });
      }

      // 2. Enqueue notification jobs per channel
      for (const channel of reminder.channels) {
        await reminderQueue.add(
          `dispatch-${channel.toLowerCase()}`,
          {
            reminderId: reminder.id,
            userId: reminder.userId,
            channel,
            title: reminder.title,
            body: reminder.body,
            scheduledAt: reminder.nextFireAt.toISOString()
          },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
            removeOnFail: 500
          }
        );
      }

      // 3. Compute and advance nextFireAt using RRULE
      let nextOccurrence: Date | null = null;
      try {
        const rule = rrulestr(reminder.rrule, { forceset: true });
        nextOccurrence = rule.after(now, false);
      } catch (rruleErr) {
        logger.error({ reminderId: reminder.id }, 'Failed to compute next rrule occurrence');
      }

      if (nextOccurrence) {
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            lastFiredAt: now,
            nextFireAt: nextOccurrence
          }
        });
      } else {
        // No future occurrences left; deactivate
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            lastFiredAt: now,
            isActive: false
          }
        });
      }

      dispatchedCount++;
    } catch (err: any) {
      logger.error({ reminderId: reminder.id, err: err.message }, 'Error dispatching reminder');
    }
  }

  return dispatchedCount;
}
