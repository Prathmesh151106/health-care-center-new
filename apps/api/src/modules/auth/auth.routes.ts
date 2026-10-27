import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { authRateLimiter } from '../../middleware/rateLimit.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema
} from '@health-care-center/shared';

export const authRoutes = Router();

// Registration
authRoutes.post('/register', authRateLimiter, validateBody(RegisterSchema), AuthController.register);

// Login
authRoutes.post('/login', authRateLimiter, validateBody(LoginSchema), AuthController.login);

// Refresh Token
authRoutes.post('/refresh', AuthController.refresh);

// Logout
authRoutes.post('/logout', AuthController.logout);

// Logout All Sessions
authRoutes.post('/logout-all', requireAuth, AuthController.logoutAll);

// Change Password
authRoutes.post('/change-password', requireAuth, validateBody(ChangePasswordSchema), AuthController.changePassword);

// Forgot Password
authRoutes.post('/forgot-password', authRateLimiter, validateBody(ForgotPasswordSchema), AuthController.forgotPassword);

// Reset Password
authRoutes.post('/reset-password', authRateLimiter, validateBody(ResetPasswordSchema), AuthController.resetPassword);
