import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { UpdateProfileSchema, UpdateSettingsSchema } from '@health-care-center/shared';

export const usersRoutes = Router();

usersRoutes.use(requireAuth);

usersRoutes.get('/me', UsersController.getMe);
usersRoutes.patch('/me', validateBody(UpdateProfileSchema), UsersController.updateMe);
usersRoutes.get('/me/settings', UsersController.getSettings);
usersRoutes.patch('/me/settings', validateBody(UpdateSettingsSchema), UsersController.updateSettings);
