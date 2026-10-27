import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestIdMiddleware, requestLoggerMiddleware } from './middleware/requestLogger.js';
import { globalRateLimiter } from './middleware/rateLimit.js';
import { errorHandlerMiddleware, notFoundHandlerMiddleware } from './middleware/errorHandler.js';
import { healthRoutes } from './modules/health/health.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import {
  usersRoutes,
  logsRoutes,
  goalsRoutes,
  medicinesRoutes,
  remindersRoutes,
  appointmentsRoutes,
  analyticsRoutes,
  notificationsRoutes,
  assistantRoutes,
  privacyRoutes
} from './modules/stubs.js';

export function createApp(): Express {
  const app = express();

  // 1. Request ID tracking
  app.use(requestIdMiddleware);

  // 2. Pino structured HTTP logger with strict data redaction
  app.use(requestLoggerMiddleware);

  // 3. Helmet security headers
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: false
    })
  );

  // 4. CORS with credentials and allowlisted origins
  const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        return callback(new Error('Blocked by CORS policy'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'baggage', 'sentry-trace']
    })
  );

  // 5. JSON body parser with strict 100 KB limit
  app.use(express.json({ limit: '100kb' }));

  // 6. Cookie parser
  app.use(cookieParser());

  // 7. Global rate limiting
  app.use('/api', globalRateLimiter);

  // 8. API Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/logs', logsRoutes);
  app.use('/api/goals', goalsRoutes);
  app.use('/api/medicines', medicinesRoutes);
  app.use('/api/reminders', remindersRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/assistant', assistantRoutes);
  app.use('/api/privacy', privacyRoutes);

  // 9. 404 handler
  app.use(notFoundHandlerMiddleware);

  // 10. Centralized Error Handler
  app.use(errorHandlerMiddleware);

  return app;
}
