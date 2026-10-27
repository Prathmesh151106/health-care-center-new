"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAccountSchema = exports.AssistantChatSchema = exports.PushSubscriptionSchema = exports.CreateAppointmentSchema = exports.CreateReminderSchema = exports.RecordMedicineEventSchema = exports.CreateMedicineSchema = exports.MedicineScheduleSchema = exports.CreateGoalSchema = exports.BulkCreateHealthLogSchema = exports.CreateHealthLogSchema = exports.HealthLogValueSchema = exports.NoteValueSchema = exports.SymptomValueSchema = exports.BloodSugarValueSchema = exports.BloodPressureValueSchema = exports.MoodValueSchema = exports.WeightValueSchema = exports.StepsValueSchema = exports.SleepValueSchema = exports.WaterValueSchema = exports.UpdateSettingsSchema = exports.UpdateProfileSchema = exports.ChangePasswordSchema = exports.ResetPasswordSchema = exports.ForgotPasswordSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
const constants_js_1 = require("./constants.js");
// Auth Schemas
exports.RegisterSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform(v => v.trim().toLowerCase()),
    password: zod_1.z.string().min(10, 'Password must be at least 10 characters long'),
    name: zod_1.z.string().min(1).max(100),
    dateOfBirth: zod_1.z.string().datetime().optional().nullable(),
    heightCm: zod_1.z.number().min(30).max(300).optional().nullable(),
    timezone: zod_1.z.string().default('UTC'),
    locale: zod_1.z.string().default('en')
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform(v => v.trim().toLowerCase()),
    password: zod_1.z.string().min(1)
});
exports.ForgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform(v => v.trim().toLowerCase())
});
exports.ResetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(10, 'Password must be at least 10 characters long')
});
exports.ChangePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().min(1),
    newPassword: zod_1.z.string().min(10, 'Password must be at least 10 characters long')
});
// User Profile & Settings
exports.UpdateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100).optional(),
    dateOfBirth: zod_1.z.string().datetime().optional().nullable(),
    heightCm: zod_1.z.number().min(30).max(300).optional().nullable(),
    timezone: zod_1.z.string().optional(),
    locale: zod_1.z.string().optional()
});
exports.UpdateSettingsSchema = zod_1.z.object({
    aiContextOptIn: zod_1.z.boolean().optional(),
    quietHoursStart: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
    quietHoursEnd: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().nullable(),
    theme: zod_1.z.enum(['light', 'dark', 'system']).optional(),
    notifEmail: zod_1.z.boolean().optional(),
    notifPush: zod_1.z.boolean().optional(),
    notifInApp: zod_1.z.boolean().optional()
});
// Health Logs
exports.WaterValueSchema = zod_1.z.object({ amountMl: zod_1.z.number().min(1).max(10000) });
exports.SleepValueSchema = zod_1.z.object({ hours: zod_1.z.number().min(0).max(24), quality: zod_1.z.number().min(1).max(5).optional() });
exports.StepsValueSchema = zod_1.z.object({ count: zod_1.z.number().int().min(0).max(200000) });
exports.WeightValueSchema = zod_1.z.object({ weightKg: zod_1.z.number().min(1).max(500) });
exports.MoodValueSchema = zod_1.z.object({ score: zod_1.z.number().int().min(1).max(5), tags: zod_1.z.array(zod_1.z.string()).optional() });
exports.BloodPressureValueSchema = zod_1.z.object({
    systolic: zod_1.z.number().int().min(50).max(300),
    diastolic: zod_1.z.number().int().min(30).max(200),
    pulse: zod_1.z.number().int().min(30).max(250).optional()
});
exports.BloodSugarValueSchema = zod_1.z.object({
    levelMgDl: zod_1.z.number().min(10).max(1000),
    mealContext: zod_1.z.enum(['FASTING', 'BEFORE_MEAL', 'AFTER_MEAL', 'BEDTIME']).optional()
});
exports.SymptomValueSchema = zod_1.z.object({
    severity: zod_1.z.number().int().min(1).max(5),
    symptomName: zod_1.z.string().min(1).max(100)
});
exports.NoteValueSchema = zod_1.z.object({
    title: zod_1.z.string().max(100).optional()
});
exports.HealthLogValueSchema = zod_1.z.union([
    exports.WaterValueSchema,
    exports.SleepValueSchema,
    exports.StepsValueSchema,
    exports.WeightValueSchema,
    exports.MoodValueSchema,
    exports.BloodPressureValueSchema,
    exports.BloodSugarValueSchema,
    exports.SymptomValueSchema,
    exports.NoteValueSchema
]);
exports.CreateHealthLogSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(constants_js_1.LogType),
    value: zod_1.z.record(zod_1.z.any()),
    unit: zod_1.z.string().max(20).optional().nullable(),
    loggedAt: zod_1.z.string().datetime().default(() => new Date().toISOString()),
    note: zod_1.z.string().max(2000).optional().nullable()
});
exports.BulkCreateHealthLogSchema = zod_1.z.object({
    logs: zod_1.z.array(exports.CreateHealthLogSchema).min(1).max(100)
});
// Goals
exports.CreateGoalSchema = zod_1.z.object({
    type: zod_1.z.nativeEnum(constants_js_1.LogType),
    targetValue: zod_1.z.number().positive(),
    period: zod_1.z.nativeEnum(constants_js_1.GoalPeriod).default(constants_js_1.GoalPeriod.DAILY)
});
// Medicines
exports.MedicineScheduleSchema = zod_1.z.object({
    times: zod_1.z.array(zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)).min(1),
    daysOfWeek: zod_1.z.array(zod_1.z.number().int().min(0).max(6)).optional() // 0=Sun, 6=Sat
});
exports.CreateMedicineSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    dose: zod_1.z.string().min(1).max(100),
    form: zod_1.z.string().min(1).max(50).default('tablet'),
    schedule: exports.MedicineScheduleSchema,
    startDate: zod_1.z.string().datetime().default(() => new Date().toISOString()),
    endDate: zod_1.z.string().datetime().optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable()
});
exports.RecordMedicineEventSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(constants_js_1.MedicineStatus),
    scheduledAt: zod_1.z.string().datetime(),
    actedAt: zod_1.z.string().datetime().default(() => new Date().toISOString())
});
// Reminders
exports.CreateReminderSchema = zod_1.z.object({
    kind: zod_1.z.nativeEnum(constants_js_1.ReminderKind),
    title: zod_1.z.string().min(1).max(150),
    body: zod_1.z.string().max(500).optional().nullable(),
    rrule: zod_1.z.string().min(1).max(300),
    timezone: zod_1.z.string().default('UTC'),
    channels: zod_1.z.array(zod_1.z.nativeEnum(constants_js_1.ReminderChannel)).min(1),
    medicineId: zod_1.z.string().uuid().optional().nullable(),
    appointmentId: zod_1.z.string().uuid().optional().nullable()
});
// Appointments
exports.CreateAppointmentSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(150),
    doctor: zod_1.z.string().max(100).optional().nullable(),
    location: zod_1.z.string().max(200).optional().nullable(),
    scheduledAt: zod_1.z.string().datetime(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    reminderOffsetMinutes: zod_1.z.number().int().min(0).max(10080).optional().nullable()
});
// Notifications
exports.PushSubscriptionSchema = zod_1.z.object({
    endpoint: zod_1.z.string().url(),
    keys: zod_1.z.object({
        p256dh: zod_1.z.string().min(1),
        auth: zod_1.z.string().min(1)
    })
});
// Assistant
exports.AssistantChatSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(2000),
    locale: zod_1.z.enum(['en', 'hi']).default('en')
});
// Privacy Account Deletion
exports.DeleteAccountSchema = zod_1.z.object({
    password: zod_1.z.string().min(1)
});
//# sourceMappingURL=schemas.js.map