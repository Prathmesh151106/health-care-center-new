import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { CreateGoalSchema } from '@health-care-center/shared';

export class GoalsController {
  static async getGoals(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const goals = await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
      res.status(200).json({ data: goals });
    } catch (err) {
      next(err);
    }
  }

  static async createGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = CreateGoalSchema.parse(req.body);

      // Deactivate existing active goal of same type and period
      await prisma.goal.updateMany({
        where: {
          userId,
          type: validated.type,
          period: validated.period,
          isActive: true
        },
        data: { isActive: false }
      });

      const goal = await prisma.goal.create({
        data: {
          userId,
          type: validated.type,
          targetValue: validated.targetValue,
          period: validated.period,
          isActive: true
        }
      });

      res.status(201).json({ data: goal });
    } catch (err) {
      next(err);
    }
  }

  static async deleteGoal(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const existing = await prisma.goal.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        throw ApiError.notFound('Goal not found');
      }

      await prisma.goal.delete({
        where: { id }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
}
