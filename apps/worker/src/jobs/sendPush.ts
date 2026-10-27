import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import { logger } from '../config.js';

const prisma = new PrismaClient();

export async function processSendPush(jobData: {
  userId: string;
  title: string;
  body?: string;
}): Promise<void> {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@dailyhealth.internal';

  if (!vapidPublicKey || !vapidPrivateKey) {
    logger.debug('Web push skipped: VAPID keys not configured');
    return;
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId: jobData.userId }
  });

  const payload = JSON.stringify({
    title: jobData.title,
    body: jobData.body || 'You have a scheduled health reminder.'
  });

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        payload
      );
    } catch (err: any) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // Expired subscription; prune from database
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      } else {
        logger.error({ subId: sub.id, status: err.statusCode }, 'Failed to deliver push notification');
      }
    }
  }
}
