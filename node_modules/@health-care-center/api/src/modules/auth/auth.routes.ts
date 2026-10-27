import { Router } from 'express';
export const authRoutes = Router();
authRoutes.get('/ping', (_req, res) => res.json({ module: 'auth' }));
