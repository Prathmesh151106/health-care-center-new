import { Router } from 'express';
import { AssistantController } from './assistant.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { AssistantChatSchema } from '@health-care-center/shared';

export const assistantRoutes = Router();

assistantRoutes.use(requireAuth);

assistantRoutes.post('/chat', validateBody(AssistantChatSchema), AssistantController.chat);
assistantRoutes.get('/history', AssistantController.getHistory);
assistantRoutes.delete('/history', AssistantController.deleteHistory);
