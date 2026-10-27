import { PrismaClient } from '@prisma/client';
import { logger } from '../config.js';
import { MedicineStatus } from '@health-care-center/shared';

const prisma = new PrismaClient();

export async function processMaintenance(): Promise<void> {
  const now = new Date();

  // 1. Mark overdue medicine events as MISSED (grace period: 120 minutes)
  const gracePeriodMinutes = parseInt(process.env.MISSED_DOSE_GRACE_MINUTES || '120', 10);
  const cutoff = new Date(now.getTime() - gracePeriodMinutes * 60 * 1000);

  const updatedEvents = await prisma.medicineEvent.updateMany({
    where: {
      status: MedicineStatus.PENDING,
      scheduledAt: { lt: cutoff }
    },
    data: {
      status: MedicineStatus.MISSED
    }
  });

  if (updatedEvents.count > 0) {
    logger.info({ count: updatedEvents.count }, 'Marked overdue medicine events as MISSED');
  }

  // 2. Prune expired refresh tokens
  const deletedRefresh = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: { lt: now }
    }
  });

  if (deletedRefresh.count > 0) {
    logger.info({ count: deletedRefresh.count }, 'Pruned expired refresh tokens');
  }

  // 3. Prune expired password reset tokens
  const deletedReset = await prisma.passwordResetToken.deleteMany({
    where: {
      expiresAt: { lt: now }
    }
  });

  if (deletedReset.count > 0) {
    logger.info({ count: deletedReset.count }, 'Pruned expired password reset tokens');
  }
}
