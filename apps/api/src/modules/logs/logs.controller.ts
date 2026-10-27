import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';
import { ApiError } from '../../utils/apiError.js';
import { encryptField, decryptField } from '../../utils/crypto.js';
import {
  CreateHealthLogSchema,
  BulkCreateHealthLogSchema,
  LogType,
  WaterValueSchema,
  SleepValueSchema,
  StepsValueSchema,
  WeightValueSchema,
  MoodValueSchema,
  BloodPressureValueSchema,
  BloodSugarValueSchema,
  SymptomValueSchema,
  NoteValueSchema
} from '@health-care-center/shared';

export class LogsController {
  private static validateMetricValue(type: string, value: any): { rangeWarning?: string } {
    let warning: string | undefined;

    switch (type) {
      case LogType.WATER:
        WaterValueSchema.parse(value);
        break;
      case LogType.SLEEP: {
        const sleep = SleepValueSchema.parse(value);
        if (sleep.hours > 14) warning = 'Sleep duration logged is above typical range (14h+)';
        if (sleep.hours < 4) warning = 'Sleep duration logged is below typical range (<4h)';
        break;
      }
      case LogType.STEPS:
        StepsValueSchema.parse(value);
        break;
      case LogType.WEIGHT:
        WeightValueSchema.parse(value);
        break;
      case LogType.MOOD:
        MoodValueSchema.parse(value);
        break;
      case LogType.BLOOD_PRESSURE: {
        const bp = BloodPressureValueSchema.parse(value);
        if (bp.systolic >= 140 || bp.diastolic >= 90) {
          warning = 'Blood pressure reading is outside standard target range';
        }
        break;
      }
      case LogType.BLOOD_SUGAR: {
        const sugar = BloodSugarValueSchema.parse(value);
        if (sugar.levelMgDl > 200 || sugar.levelMgDl < 70) {
          warning = 'Blood sugar reading is outside standard target range';
        }
        break;
      }
      case LogType.SYMPTOM:
        SymptomValueSchema.parse(value);
        break;
      case LogType.NOTE:
        NoteValueSchema.parse(value);
        break;
      default:
        throw ApiError.validationError(`Unsupported log type: ${type}`);
    }

    return { rangeWarning: warning };
  }

  static async createLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const validated = CreateHealthLogSchema.parse(req.body);
      const { rangeWarning } = LogsController.validateMetricValue(validated.type, validated.value);

      const encryptedNote = validated.note ? encryptField(validated.note) : null;

      const log = await prisma.healthLog.create({
        data: {
          userId,
          type: validated.type,
          value: validated.value,
          unit: validated.unit,
          loggedAt: new Date(validated.loggedAt),
          encryptedNote
        }
      });

      res.status(201).json({
        data: {
          id: log.id,
          type: log.type,
          value: log.value,
          unit: log.unit,
          loggedAt: log.loggedAt,
          note: validated.note || null,
          createdAt: log.createdAt
        },
        meta: rangeWarning ? { warning: rangeWarning } : undefined
      });
    } catch (err) {
      next(err);
    }
  }

  static async bulkCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { logs } = BulkCreateHealthLogSchema.parse(req.body);

      const createdLogs = await prisma.$transaction(async (tx) => {
        const records = [];
        for (const item of logs) {
          LogsController.validateMetricValue(item.type, item.value);
          const encryptedNote = item.note ? encryptField(item.note) : null;
          const record = await tx.healthLog.create({
            data: {
              userId,
              type: item.type,
              value: item.value,
              unit: item.unit,
              loggedAt: new Date(item.loggedAt),
              encryptedNote
            }
          });
          records.push({
            id: record.id,
            type: record.type,
            value: record.value,
            unit: record.unit,
            loggedAt: record.loggedAt,
            note: item.note || null,
            createdAt: record.createdAt
          });
        }
        return records;
      });

      res.status(201).json({
        data: createdLogs,
        meta: { count: createdLogs.length }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { type, from, to, limit = '50', cursor } = req.query as Record<string, string | undefined>;

      const take = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);

      const where: any = { userId };
      if (type) where.type = type;
      if (from || to) {
        where.loggedAt = {};
        if (from) where.loggedAt.gte = new Date(from);
        if (to) where.loggedAt.lte = new Date(to);
      }

      const logs = await prisma.healthLog.findMany({
        where,
        take: take + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        orderBy: { loggedAt: 'desc' }
      });

      let nextCursor: string | null = null;
      if (logs.length > take) {
        const nextItem = logs.pop();
        nextCursor = nextItem?.id || null;
      }

      const decrypted = logs.map((log) => ({
        id: log.id,
        type: log.type,
        value: log.value,
        unit: log.unit,
        loggedAt: log.loggedAt,
        note: decryptField(log.encryptedNote),
        createdAt: log.createdAt
      }));

      res.status(200).json({
        data: decrypted,
        meta: {
          nextCursor,
          count: decrypted.length
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getLogById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const log = await prisma.healthLog.findFirst({
        where: { id, userId }
      });

      if (!log) {
        throw ApiError.notFound('Health log not found');
      }

      res.status(200).json({
        data: {
          id: log.id,
          type: log.type,
          value: log.value,
          unit: log.unit,
          loggedAt: log.loggedAt,
          note: decryptField(log.encryptedNote),
          createdAt: log.createdAt
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async deleteLog(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const id = String(req.params.id);

      const existing = await prisma.healthLog.findFirst({
        where: { id, userId }
      });

      if (!existing) {
        throw ApiError.notFound('Health log not found');
      }

      await prisma.healthLog.delete({
        where: { id }
      });

      res.status(200).json({ data: { success: true } });
    } catch (err) {
      next(err);
    }
  }
}
