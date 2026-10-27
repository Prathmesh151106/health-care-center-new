import { Router } from 'express';
import { RemindersController } from './reminders.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateReminderSchema } from '@health-care-center/shared';

export const remindersRoutes = Router();

remindersRoutes.use(requireAuth);

remindersRoutes.get('/', RemindersController.getReminders);
remindersRoutes.post('/', validateBody(CreateReminderSchema), RemindersController.createReminder);
remindersRoutes.post('/:id/snooze', RemindersController.snoozeReminder);
remindersRoutes.delete('/:id', RemindersController.deleteReminder);
