import { Router } from 'express';
import { LogsController } from './logs.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateHealthLogSchema, BulkCreateHealthLogSchema } from '@health-care-center/shared';

export const logsRoutes = Router();

logsRoutes.use(requireAuth);

logsRoutes.get('/', LogsController.getLogs);
logsRoutes.post('/', validateBody(CreateHealthLogSchema), LogsController.createLog);
logsRoutes.post('/bulk', validateBody(BulkCreateHealthLogSchema), LogsController.bulkCreate);
logsRoutes.get('/:id', LogsController.getLogById);
logsRoutes.delete('/:id', LogsController.deleteLog);
