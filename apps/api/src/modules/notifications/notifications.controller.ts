import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';
import { PushSubscriptionSchema } from '@health-care-center/shared';
import webpush from 'web-push';

export class NotificationsController {
  static async getVapidPublicKey(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!env.VAPID_PUBLIC_KEY) {
        throw ApiError.serviceUnavailable('Web Push is not configured on this server');
      }
      res.status(200).json({ data: { publicKey: env.VAPID_PUBLIC_KEY } });
    } catch (err) {
      next(err);
    }
  }

  static async subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = PushSubscriptionSchema.parse(req.body);

      const sub = await prisma.pushSubscription.upsert({
        where: { endpoint: validated.endpoint },
        create: {
          userId,
          endpoint: validated.endpoint,
          p256dh: validated.keys.p256dh,
          auth: validated.keys.auth,
          userAgent: req.headers['user-agent']?.slice(0, 200)
        },
        update: {
          userId,
          p256dh: validated.keys.p256dh,
          auth: validated.keys.auth,
          userAgent: req.headers['user-agent']?.slice(0, 200)
        }
      });

      res.status(201).json({ data: { id: sub.id, success: true } });
    } catch (err) {
      next(err);
    }
  }

  static async unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { endpoint } = req.body;
      if (!endpoint) {
        throw ApiError.validationError('Endpoint is required to unsubscribe');
      }

      await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }

  static async sendTestNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
        throw ApiError.serviceUnavailable('Web Push is not configured');
      }

      const subs = await prisma.pushSubscription.findMany({
        where: { userId }
      });

      if (subs.length === 0) {
        throw ApiError.notFound('No active push subscriptions found for this user');
      }

      webpush.setVapidDetails(
        env.VAPID_SUBJECT || 'mailto:support@dailyhealth.internal',
        env.VAPID_PUBLIC_KEY,
        env.VAPID_PRIVATE_KEY
      );

      const payload = JSON.stringify({
        title: 'Daily Health Companion',
        body: 'Test notification delivered successfully.'
      });

      for (const s of subs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: s.endpoint,
              keys: { p256dh: s.p256dh, auth: s.auth }
            },
            payload
          );
        } catch (pushErr: any) {
          if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
            await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          }
        }
      }

      res.status(200).json({ data: { sent: true, count: subs.length } });
    } catch (err) {
      next(err);
    }
  }
}
