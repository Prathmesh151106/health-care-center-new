import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { rrulestr } from 'rrule';
import { CreateReminderSchema } from '@health-care-center/shared';

export class RemindersController {
  static async getReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const reminders = await prisma.reminder.findMany({
        where: { userId },
        include: {
          medicine: { select: { id: true, name: true, dose: true } },
          appointment: { select: { id: true, title: true, scheduledAt: true } }
        },
        orderBy: { nextFireAt: 'asc' }
      });

      res.status(200).json({ data: reminders });
    } catch (err) {
      next(err);
    }
  }

  static async createReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = CreateReminderSchema.parse(req.body);

      // Validate RRULE and compute next fire time
      let nextFireAt: Date;
      try {
        const rule = rrulestr(validated.rrule, { forceset: true });
        const next = rule.after(new Date(), true);
        if (!next) {
          throw new Error('Recurrence rule produced no future occurrences');
        }
        nextFireAt = next;
      } catch (err: any) {
        throw ApiError.validationError(`Invalid recurrence rule: ${err.message}`);
      }

      // Check quiet hours from user settings
      const settings = await prisma.userSettings.findUnique({ where: { userId } });
      if (settings?.quietHoursStart && settings?.quietHoursEnd) {
        // e.g. "22:00" to "07:00"
        const fireHour = nextFireAt.getUTCHours();
        const startHour = parseInt(settings.quietHoursStart.split(':')[0] || '22', 10);
        const endHour = parseInt(settings.quietHoursEnd.split(':')[0] || '7', 10);
        if (startHour > endHour) {
          // Crosses midnight
          if (fireHour >= startHour || fireHour < endHour) {
            nextFireAt.setUTCHours(endHour, 0, 0, 0);
          }
        }
      }

      const reminder = await prisma.reminder.create({
        data: {
          userId,
          kind: validated.kind,
          title: validated.title,
          body: validated.body,
          rrule: validated.rrule,
          timezone: validated.timezone,
          nextFireAt,
          channels: validated.channels,
          medicineId: validated.medicineId,
          appointmentId: validated.appointmentId,
          isActive: true
        }
      });

      res.status(201).json({ data: reminder });
    } catch (err) {
      next(err);
    }
  }

  static async snoozeReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);
      const { minutes = 15 } = req.body;

      const reminder = await prisma.reminder.findFirst({
        where: { id, userId }
      });

      if (!reminder) {
        throw ApiError.notFound('Reminder not found');
      }

      const snoozedTime = new Date(Date.now() + minutes * 60 * 1000);

      const updated = await prisma.reminder.update({
        where: { id },
        data: {
          nextFireAt: snoozedTime,
          isActive: true
        }
      });

      res.status(200).json({ data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deleteReminder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const existing = await prisma.reminder.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        throw ApiError.notFound('Reminder not found');
      }

      await prisma.reminder.delete({
        where: { id }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
}
