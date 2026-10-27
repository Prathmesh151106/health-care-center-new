import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { PushSubscriptionSchema } from '@health-care-center/shared';

export const notificationsRoutes = Router();

notificationsRoutes.get('/vapid-public-key', NotificationsController.getVapidPublicKey);

notificationsRoutes.use(requireAuth);

notificationsRoutes.post('/subscribe', validateBody(PushSubscriptionSchema), NotificationsController.subscribe);
notificationsRoutes.post('/unsubscribe', NotificationsController.unsubscribe);
notificationsRoutes.post('/test', NotificationsController.sendTestNotification);
