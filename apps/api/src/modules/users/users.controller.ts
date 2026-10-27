import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { UpdateProfileSchema, UpdateSettingsSchema } from '@health-care-center/shared';

export class UsersController {
  static async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          dateOfBirth: true,
          heightCm: true,
          timezone: true,
          locale: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      res.status(200).json({ data: user });
    } catch (err) {
      next(err);
    }
  }

  static async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = UpdateProfileSchema.parse(req.body);

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(validated.name !== undefined && { name: validated.name }),
          ...(validated.dateOfBirth !== undefined && {
            dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : null
          }),
          ...(validated.heightCm !== undefined && { heightCm: validated.heightCm }),
          ...(validated.timezone !== undefined && { timezone: validated.timezone }),
          ...(validated.locale !== undefined && { locale: validated.locale })
        },
        select: {
          id: true,
          email: true,
          name: true,
          dateOfBirth: true,
          heightCm: true,
          timezone: true,
          locale: true,
          updatedAt: true
        }
      });

      res.status(200).json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      let settings = await prisma.userSettings.findUnique({
        where: { userId }
      });

      if (!settings) {
        settings = await prisma.userSettings.create({
          data: { userId }
        });
      }

      res.status(200).json({ data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = UpdateSettingsSchema.parse(req.body);

      const updated = await prisma.userSettings.upsert({
        where: { userId },
        create: {
          userId,
          ...validated
        },
        update: validated
      });

      res.status(200).json({ data: updated });
    } catch (err) {
      next(err);
    }
  }
}
