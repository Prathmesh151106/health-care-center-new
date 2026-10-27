import { Router } from 'express';
import { PrivacyController } from './privacy.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { DeleteAccountSchema } from '@health-care-center/shared';

export const privacyRoutes = Router();

privacyRoutes.use(requireAuth);

privacyRoutes.get('/export', PrivacyController.exportData);
privacyRoutes.delete('/account', validateBody(DeleteAccountSchema), PrivacyController.deleteAccount);
