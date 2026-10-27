import { z } from 'zod';
import { LogType, GoalPeriod, MedicineStatus, ReminderKind, ReminderChannel } from './constants.js';

// Auth Schemas
export const RegisterSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(10, 'Password must be at least 10 characters long'),
  name: z.string().min(1).max(100),
  dateOfBirth: z.string().datetime().optional().nullable(),
  heightCm: z.number().min(30).max(300).optional().nullable(),
  timezone: z.string().default('UTC'),
  locale: z.string().default('en')
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase()),
  password: z.string().min(1)
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email().transform(v => v.trim().toLowerCase())
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(10, 'Password must be at least 10 characters long')
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(10, 'Password must be at least 10 characters long')
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// User Profile & Settings
export const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  heightCm: z.number().min(30).max(300).optional().nullable(),
  timezone: z.string().optional(),
  locale: z.string().optional()
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const UpdateSettingsSchema = z.object({
  aiContextOptIn: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifEmail: z.boolean().optional(),
  notifPush: z.boolean().optional(),
  notifInApp: z.boolean().optional()
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// Health Logs
export const WaterValueSchema = z.object({ amountMl: z.number().min(1).max(10000) });
export const SleepValueSchema = z.object({ hours: z.number().min(0).max(24), quality: z.number().min(1).max(5).optional() });
export const StepsValueSchema = z.object({ count: z.number().int().min(0).max(200000) });
export const WeightValueSchema = z.object({ weightKg: z.number().min(1).max(500) });
export const MoodValueSchema = z.object({ score: z.number().int().min(1).max(5), tags: z.array(z.string()).optional() });
export const BloodPressureValueSchema = z.object({
  systolic: z.number().int().min(50).max(300),
  diastolic: z.number().int().min(30).max(200),
  pulse: z.number().int().min(30).max(250).optional()
});
export const BloodSugarValueSchema = z.object({
  levelMgDl: z.number().min(10).max(1000),
  mealContext: z.enum(['FASTING', 'BEFORE_MEAL', 'AFTER_MEAL', 'BEDTIME']).optional()
});
export const SymptomValueSchema = z.object({
  severity: z.number().int().min(1).max(5),
  symptomName: z.string().min(1).max(100)
});
export const NoteValueSchema = z.object({
  title: z.string().max(100).optional()
});

export const HealthLogValueSchema = z.union([
  WaterValueSchema,
  SleepValueSchema,
  StepsValueSchema,
  WeightValueSchema,
  MoodValueSchema,
  BloodPressureValueSchema,
  BloodSugarValueSchema,
  SymptomValueSchema,
  NoteValueSchema
]);

export const CreateHealthLogSchema = z.object({
  type: z.nativeEnum(LogType),
  value: z.record(z.any()),
  unit: z.string().max(20).optional().nullable(),
  loggedAt: z.string().datetime().default(() => new Date().toISOString()),
  note: z.string().max(2000).optional().nullable()
});
export type CreateHealthLogInput = z.infer<typeof CreateHealthLogSchema>;

export const BulkCreateHealthLogSchema = z.object({
  logs: z.array(CreateHealthLogSchema).min(1).max(100)
});
export type BulkCreateHealthLogInput = z.infer<typeof BulkCreateHealthLogSchema>;

// Goals
export const CreateGoalSchema = z.object({
  type: z.nativeEnum(LogType),
  targetValue: z.number().positive(),
  period: z.nativeEnum(GoalPeriod).default(GoalPeriod.DAILY)
});
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;

// Medicines
export const MedicineScheduleSchema = z.object({
  times: z.array(z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).min(1),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional() // 0=Sun, 6=Sat
});

export const CreateMedicineSchema = z.object({
  name: z.string().min(1).max(100),
  dose: z.string().min(1).max(100),
  form: z.string().min(1).max(50).default('tablet'),
  schedule: MedicineScheduleSchema,
  startDate: z.string().datetime().default(() => new Date().toISOString()),
  endDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(1000).optional().nullable()
});
export type CreateMedicineInput = z.infer<typeof CreateMedicineSchema>;

export const RecordMedicineEventSchema = z.object({
  status: z.nativeEnum(MedicineStatus),
  scheduledAt: z.string().datetime(),
  actedAt: z.string().datetime().default(() => new Date().toISOString())
});
export type RecordMedicineEventInput = z.infer<typeof RecordMedicineEventSchema>;

// Reminders
export const CreateReminderSchema = z.object({
  kind: z.nativeEnum(ReminderKind),
  title: z.string().min(1).max(150),
  body: z.string().max(500).optional().nullable(),
  rrule: z.string().min(1).max(300),
  timezone: z.string().default('UTC'),
  channels: z.array(z.nativeEnum(ReminderChannel)).min(1),
  medicineId: z.string().uuid().optional().nullable(),
  appointmentId: z.string().uuid().optional().nullable()
});
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;

// Appointments
export const CreateAppointmentSchema = z.object({
  title: z.string().min(1).max(150),
  doctor: z.string().max(100).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  scheduledAt: z.string().datetime(),
  notes: z.string().max(1000).optional().nullable(),
  reminderOffsetMinutes: z.number().int().min(0).max(10080).optional().nullable()
});
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;

// Notifications
export const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  })
});
export type PushSubscriptionInput = z.infer<typeof PushSubscriptionSchema>;

// Assistant
export const AssistantChatSchema = z.object({
  message: z.string().min(1).max(2000),
  locale: z.enum(['en', 'hi']).default('en')
});
export type AssistantChatInput = z.infer<typeof AssistantChatSchema>;

// Privacy Account Deletion
export const DeleteAccountSchema = z.object({
  password: z.string().min(1)
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>;
