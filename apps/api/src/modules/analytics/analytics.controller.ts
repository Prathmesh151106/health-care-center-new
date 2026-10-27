import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { redis } from '../../config/redis.js';
import { LogType } from '@health-care-center/shared';

export class AnalyticsController {
  static async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const cacheKey = `analytics:summary:${userId}`;

      const cached = await redis.get(cacheKey);
      if (cached) {
        res.status(200).json({ data: JSON.parse(cached), meta: { cached: true } });
        return;
      }

      // Today in user context
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);

      const [logs, goals, upcomingReminders] = await Promise.all([
        prisma.healthLog.findMany({
          where: {
            userId,
            loggedAt: { gte: todayStart }
          }
        }),
        prisma.goal.findMany({
          where: { userId, isActive: true }
        }),
        prisma.reminder.findMany({
          where: {
            userId,
            isActive: true,
            nextFireAt: { gte: new Date() }
          },
          take: 5,
          orderBy: { nextFireAt: 'asc' }
        })
      ]);

      // Calculate progress per goal
      const progress = goals.map((goal) => {
        const matchingLogs = logs.filter((l) => l.type === goal.type);
        let current = 0;
        if (goal.type === LogType.WATER) {
          current = matchingLogs.reduce((sum, l) => sum + ((l.value as any).amountMl || 0), 0);
        } else if (goal.type === LogType.STEPS) {
          current = matchingLogs.reduce((sum, l) => sum + ((l.value as any).count || 0), 0);
        } else if (goal.type === LogType.SLEEP) {
          current = matchingLogs.reduce((sum, l) => sum + ((l.value as any).hours || 0), 0);
        }
        const percentage = Math.min(Math.round((current / (goal.targetValue || 1)) * 100), 100);
        return {
          goalId: goal.id,
          type: goal.type,
          target: goal.targetValue,
          current,
          percentage
        };
      });

      const result = {
        date: todayStart.toISOString().split('T')[0],
        goalsProgress: progress,
        todayLogsCount: logs.length,
        upcomingReminders: upcomingReminders.map((r) => ({
          id: r.id,
          title: r.title,
          nextFireAt: r.nextFireAt,
          kind: r.kind
        }))
      };

      // Cache for 60 seconds
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

      res.status(200).json({ data: result, meta: { cached: false } });
    } catch (err) {
      next(err);
    }
  }

  static async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { type = 'WATER', range = '7d' } = req.query as Record<string, string>;

      const days = range === '90d' ? 90 : range === '30d' ? 30 : 7;
      const sinceDate = new Date();
      sinceDate.setUTCDate(sinceDate.getUTCDate() - days);
      sinceDate.setUTCHours(0, 0, 0, 0);

      const logs = await prisma.healthLog.findMany({
        where: {
          userId,
          type: type as any,
          loggedAt: { gte: sinceDate }
        },
        orderBy: { loggedAt: 'asc' }
      });

      // Group by date in UTC
      const grouped: Record<string, number> = {};
      logs.forEach((log) => {
        const dateKey = log.loggedAt.toISOString().split('T')[0]!;
        let val = 0;
        const v = log.value as any;
        if (type === 'WATER') val = v.amountMl || 0;
        else if (type === 'STEPS') val = v.count || 0;
        else if (type === 'SLEEP') val = v.hours || 0;
        else if (type === 'WEIGHT') val = v.weightKg || 0;
        else if (type === 'MOOD') val = v.score || 0;

        grouped[dateKey] = (grouped[dateKey] || 0) + val;
      });

      const series = Object.entries(grouped).map(([date, total]) => ({ date, total }));

      res.status(200).json({
        data: {
          type,
          range,
          series
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getStreaks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      // Find distinct days with health logs in last 60 days
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setUTCDate(sixtyDaysAgo.getUTCDate() - 60);

      const logs = await prisma.healthLog.findMany({
        where: {
          userId,
          loggedAt: { gte: sixtyDaysAgo }
        },
        select: { loggedAt: true },
        orderBy: { loggedAt: 'desc' }
      });

      const uniqueDays = Array.from(
        new Set(logs.map((l) => l.loggedAt.toISOString().split('T')[0]))
      ).sort().reverse();

      let currentStreak = 0;
      let checkDate = new Date();
      checkDate.setUTCHours(0, 0, 0, 0);

      for (const dayStr of uniqueDays) {
        const expectedStr = checkDate.toISOString().split('T')[0];
        if (dayStr === expectedStr) {
          currentStreak++;
          checkDate.setUTCDate(checkDate.getUTCDate() - 1);
        } else {
          // If today wasn't logged yet, allow yesterday to count for active streak
          if (currentStreak === 0) {
            checkDate.setUTCDate(checkDate.getUTCDate() - 1);
            if (dayStr === checkDate.toISOString().split('T')[0]) {
              currentStreak++;
              checkDate.setUTCDate(checkDate.getUTCDate() - 1);
              continue;
            }
          }
          break;
        }
      }

      res.status(200).json({
        data: {
          currentStreak,
          totalLoggedDays: uniqueDays.length
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
