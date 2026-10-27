import { Router } from 'express';
import { AnalyticsController } from './analytics.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const analyticsRoutes = Router();

analyticsRoutes.use(requireAuth);

analyticsRoutes.get('/summary', AnalyticsController.getSummary);
analyticsRoutes.get('/trends', AnalyticsController.getTrends);
analyticsRoutes.get('/streaks', AnalyticsController.getStreaks);
