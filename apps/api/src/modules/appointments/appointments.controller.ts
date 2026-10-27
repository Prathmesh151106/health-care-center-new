import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { encryptField, decryptField } from '../../utils/crypto.js';
import { CreateAppointmentSchema, ReminderKind, ReminderChannel } from '@health-care-center/shared';

export class AppointmentsController {
  static async getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const appointments = await prisma.appointment.findMany({
        where: { userId },
        include: { reminders: true },
        orderBy: { scheduledAt: 'asc' }
      });

      const formatted = appointments.map((a) => ({
        id: a.id,
        title: a.title,
        doctor: a.doctor,
        location: a.location,
        scheduledAt: a.scheduledAt,
        notes: decryptField(a.encryptedNotes),
        reminderOffsetMinutes: a.reminderOffsetMinutes,
        reminders: a.reminders,
        createdAt: a.createdAt
      }));

      res.status(200).json({ data: formatted });
    } catch (err) {
      next(err);
    }
  }

  static async createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = CreateAppointmentSchema.parse(req.body);

      const encryptedNotes = validated.notes ? encryptField(validated.notes) : null;
      const scheduledAt = new Date(validated.scheduledAt);

      const appointment = await prisma.$transaction(async (tx) => {
        const appt = await tx.appointment.create({
          data: {
            userId,
            title: validated.title,
            doctor: validated.doctor,
            location: validated.location,
            scheduledAt,
            encryptedNotes,
            reminderOffsetMinutes: validated.reminderOffsetMinutes
          }
        });

        if (validated.reminderOffsetMinutes && validated.reminderOffsetMinutes > 0) {
          const reminderFireAt = new Date(scheduledAt.getTime() - validated.reminderOffsetMinutes * 60 * 1000);
          if (reminderFireAt.getTime() > Date.now()) {
            await tx.reminder.create({
              data: {
                userId,
                appointmentId: appt.id,
                kind: ReminderKind.APPOINTMENT,
                title: `Upcoming appointment: ${appt.title}`,
                body: appt.doctor ? `With ${appt.doctor}` : undefined,
                rrule: 'FREQ=DAILY;COUNT=1',
                timezone: req.user!.timezone || 'UTC',
                nextFireAt: reminderFireAt,
                channels: [ReminderChannel.IN_APP, ReminderChannel.EMAIL, ReminderChannel.PUSH],
                isActive: true
              }
            });
          }
        }

        return appt;
      });

      res.status(201).json({
        data: {
          id: appointment.id,
          title: appointment.title,
          doctor: appointment.doctor,
          location: appointment.location,
          scheduledAt: appointment.scheduledAt,
          notes: validated.notes || null,
          reminderOffsetMinutes: appointment.reminderOffsetMinutes,
          createdAt: appointment.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const existing = await prisma.appointment.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        throw ApiError.notFound('Appointment not found');
      }

      await prisma.appointment.delete({
        where: { id }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
}
