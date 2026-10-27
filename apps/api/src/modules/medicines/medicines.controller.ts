import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { encryptField, decryptField } from '../../utils/crypto.js';
import {
  CreateMedicineSchema,
  RecordMedicineEventSchema,
  MedicineStatus,
  ReminderKind,
  ReminderChannel
} from '@health-care-center/shared';

export class MedicinesController {
  static async getMedicines(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const medicines = await prisma.medicine.findMany({
        where: { userId },
        include: {
          events: {
            take: 10,
            orderBy: { scheduledAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      const formatted = medicines.map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        form: m.form,
        schedule: m.schedule,
        startDate: m.startDate,
        endDate: m.endDate,
        isActive: m.isActive,
        notes: decryptField(m.encryptedNotes),
        recentEvents: m.events,
        createdAt: m.createdAt
      }));

      res.status(200).json({ data: formatted });
    } catch (err) {
      next(err);
    }
  }

  static async createMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = CreateMedicineSchema.parse(req.body);

      const encryptedNotes = validated.notes ? encryptField(validated.notes) : null;

      const medicine = await prisma.$transaction(async (tx) => {
        const med = await tx.medicine.create({
          data: {
            userId,
            name: validated.name,
            dose: validated.dose,
            form: validated.form,
            schedule: validated.schedule,
            startDate: new Date(validated.startDate),
            endDate: validated.endDate ? new Date(validated.endDate) : null,
            encryptedNotes,
            isActive: true
          }
        });

        // Automatically create a linked reminder for the schedule
        const firstTime = validated.schedule.times[0] || '09:00';
        const [hoursStr, minutesStr] = firstTime.split(':');
        const initialDate = new Date();
        initialDate.setUTCHours(parseInt(hoursStr || '9', 10), parseInt(minutesStr || '0', 10), 0, 0);
        if (initialDate.getTime() < Date.now()) {
          initialDate.setUTCDate(initialDate.getUTCDate() + 1);
        }

        await tx.reminder.create({
          data: {
            userId,
            medicineId: med.id,
            kind: ReminderKind.MEDICINE,
            title: `Take ${med.name}`,
            body: `${med.dose} (${med.form})`,
            rrule: 'FREQ=DAILY;INTERVAL=1',
            timezone: req.user!.timezone || 'UTC',
            nextFireAt: initialDate,
            channels: [ReminderChannel.IN_APP, ReminderChannel.PUSH],
            isActive: true
          }
        });

        return med;
      });

      res.status(201).json({
        data: {
          id: medicine.id,
          name: medicine.name,
          dose: medicine.dose,
          form: medicine.form,
          schedule: medicine.schedule,
          startDate: medicine.startDate,
          endDate: medicine.endDate,
          notes: validated.notes || null,
          isActive: medicine.isActive,
          createdAt: medicine.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async recordEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);
      const validated = RecordMedicineEventSchema.parse(req.body);

      // Verify medicine ownership
      const medicine = await prisma.medicine.findFirst({
        where: { id, userId }
      });

      if (!medicine) {
        throw ApiError.notFound('Medicine not found');
      }

      const scheduledAt = new Date(validated.scheduledAt);

      const event = await prisma.medicineEvent.upsert({
        where: {
          unique_medicine_scheduled_event: {
            medicineId: id,
            scheduledAt
          }
        },
        create: {
          medicineId: id,
          scheduledAt,
          status: validated.status,
          actedAt: new Date(validated.actedAt)
        },
        update: {
          status: validated.status,
          actedAt: new Date(validated.actedAt)
        }
      });

      res.status(200).json({ data: event });
    } catch (err) {
      next(err);
    }
  }

  static async getAdherence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { from, to } = req.query as Record<string, string | undefined>;

      const whereDate: any = {};
      if (from) whereDate.gte = new Date(from);
      if (to) whereDate.lte = new Date(to);

      const userMedicines = await prisma.medicine.findMany({
        where: { userId },
        select: { id: true, name: true }
      });

      const medIds = userMedicines.map((m) => m.id);

      const events = await prisma.medicineEvent.findMany({
        where: {
          medicineId: { in: medIds },
          ...(from || to ? { scheduledAt: whereDate } : {})
        }
      });

      const total = events.length;
      const taken = events.filter((e) => e.status === MedicineStatus.TAKEN).length;
      const skipped = events.filter((e) => e.status === MedicineStatus.SKIPPED).length;
      const missed = events.filter((e) => e.status === MedicineStatus.MISSED).length;
      const adherenceRate = total > 0 ? Math.round((taken / total) * 100) : 100;

      res.status(200).json({
        data: {
          totalEvents: total,
          taken,
          skipped,
          missed,
          adherenceRate
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteMedicine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const existing = await prisma.medicine.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        throw ApiError.notFound('Medicine not found');
      }

      await prisma.medicine.delete({
        where: { id }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
}
