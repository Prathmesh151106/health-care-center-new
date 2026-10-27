import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { verifyPassword } from '../../utils/hash.js';
import { decryptField } from '../../utils/crypto.js';
import { DeleteAccountSchema } from '@health-care-center/shared';

export class PrivacyController {
  static async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const [user, settings, logs, goals, medicines, reminders, appointments] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            dateOfBirth: true,
            heightCm: true,
            timezone: true,
            locale: true,
            createdAt: true
          }
        }),
        prisma.userSettings.findUnique({ where: { userId } }),
        prisma.healthLog.findMany({ where: { userId }, orderBy: { loggedAt: 'desc' } }),
        prisma.goal.findMany({ where: { userId } }),
        prisma.medicine.findMany({ where: { userId }, include: { events: true } }),
        prisma.reminder.findMany({ where: { userId } }),
        prisma.appointment.findMany({ where: { userId } })
      ]);

      const decryptedLogs = logs.map((l) => ({
        id: l.id,
        type: l.type,
        value: l.value,
        unit: l.unit,
        loggedAt: l.loggedAt,
        note: decryptField(l.encryptedNote),
        createdAt: l.createdAt
      }));

      const decryptedMedicines = medicines.map((m) => ({
        id: m.id,
        name: m.name,
        dose: m.dose,
        form: m.form,
        schedule: m.schedule,
        startDate: m.startDate,
        endDate: m.endDate,
        notes: decryptField(m.encryptedNotes),
        events: m.events
      }));

      const decryptedAppointments = appointments.map((a) => ({
        id: a.id,
        title: a.title,
        doctor: a.doctor,
        location: a.location,
        scheduledAt: a.scheduledAt,
        notes: decryptField(a.encryptedNotes)
      }));

      // Record non-sensitive audit event
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'DATA_EXPORTED',
          metadata: { ip: req.ip }
        }
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="health-companion-export.json"');

      res.status(200).json({
        exportDate: new Date().toISOString(),
        profile: user,
        settings,
        healthLogs: decryptedLogs,
        goals,
        medicines: decryptedMedicines,
        reminders,
        appointments: decryptedAppointments
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { password } = DeleteAccountSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw ApiError.notFound('User not found');
      }

      const isValid = await verifyPassword(user.passwordHash, password);
      if (!isValid) {
        throw ApiError.unauthorized('Incorrect password confirmation for account deletion');
      }

      // Record anonymous audit log before deleting user (userId set to null due to SetNull)
      await prisma.auditLog.create({
        data: {
          action: 'ACCOUNT_DELETED',
          metadata: { timestamp: new Date().toISOString() }
        }
      });

      // Cascades all user data at DB level
      await prisma.user.delete({
        where: { id: userId }
      });

      // Clear refresh cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      res.status(200).json({ data: { message: 'Account and associated data deleted permanently' } });
    } catch (err) {
      next(err);
    }
  }
}
