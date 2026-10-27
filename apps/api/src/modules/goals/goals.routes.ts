import { Router } from 'express';
import { GoalsController } from './goals.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { CreateGoalSchema } from '@health-care-center/shared';

export const goalsRoutes = Router();

goalsRoutes.use(requireAuth);

goalsRoutes.get('/', GoalsController.getGoals);
goalsRoutes.post('/', validateBody(CreateGoalSchema), GoalsController.createGoal);
goalsRoutes.delete('/:id', GoalsController.deleteGoal);
