import { z } from 'zod';
export declare const RegisterSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
    name: z.ZodString;
    dateOfBirth: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    heightCm: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    timezone: z.ZodDefault<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    timezone: string;
    locale: string;
    dateOfBirth?: string | null | undefined;
    heightCm?: number | null | undefined;
}, {
    email: string;
    password: string;
    name: string;
    dateOfBirth?: string | null | undefined;
    heightCm?: number | null | undefined;
    timezone?: string | undefined;
    locale?: string | undefined;
}>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export type LoginInput = z.infer<typeof LoginSchema>;
export declare const ForgotPasswordSchema: z.ZodObject<{
    email: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export declare const ResetPasswordSchema: z.ZodObject<{
    token: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    token: string;
    newPassword: string;
}, {
    token: string;
    newPassword: string;
}>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export declare const ChangePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    newPassword: string;
    currentPassword: string;
}, {
    newPassword: string;
    currentPassword: string;
}>;
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
export declare const UpdateProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    dateOfBirth: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    heightCm: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    timezone: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    dateOfBirth?: string | null | undefined;
    heightCm?: number | null | undefined;
    timezone?: string | undefined;
    locale?: string | undefined;
}, {
    name?: string | undefined;
    dateOfBirth?: string | null | undefined;
    heightCm?: number | null | undefined;
    timezone?: string | undefined;
    locale?: string | undefined;
}>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export declare const UpdateSettingsSchema: z.ZodObject<{
    aiContextOptIn: z.ZodOptional<z.ZodBoolean>;
    quietHoursStart: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    quietHoursEnd: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    theme: z.ZodOptional<z.ZodEnum<["light", "dark", "system"]>>;
    notifEmail: z.ZodOptional<z.ZodBoolean>;
    notifPush: z.ZodOptional<z.ZodBoolean>;
    notifInApp: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    aiContextOptIn?: boolean | undefined;
    quietHoursStart?: string | null | undefined;
    quietHoursEnd?: string | null | undefined;
    theme?: "system" | "light" | "dark" | undefined;
    notifEmail?: boolean | undefined;
    notifPush?: boolean | undefined;
    notifInApp?: boolean | undefined;
}, {
    aiContextOptIn?: boolean | undefined;
    quietHoursStart?: string | null | undefined;
    quietHoursEnd?: string | null | undefined;
    theme?: "system" | "light" | "dark" | undefined;
    notifEmail?: boolean | undefined;
    notifPush?: boolean | undefined;
    notifInApp?: boolean | undefined;
}>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;
export declare const WaterValueSchema: z.ZodObject<{
    amountMl: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amountMl: number;
}, {
    amountMl: number;
}>;
export declare const SleepValueSchema: z.ZodObject<{
    hours: z.ZodNumber;
    quality: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    hours: number;
    quality?: number | undefined;
}, {
    hours: number;
    quality?: number | undefined;
}>;
export declare const StepsValueSchema: z.ZodObject<{
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
}, {
    count: number;
}>;
export declare const WeightValueSchema: z.ZodObject<{
    weightKg: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    weightKg: number;
}, {
    weightKg: number;
}>;
export declare const MoodValueSchema: z.ZodObject<{
    score: z.ZodNumber;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    score: number;
    tags?: string[] | undefined;
}, {
    score: number;
    tags?: string[] | undefined;
}>;
export declare const BloodPressureValueSchema: z.ZodObject<{
    systolic: z.ZodNumber;
    diastolic: z.ZodNumber;
    pulse: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    systolic: number;
    diastolic: number;
    pulse?: number | undefined;
}, {
    systolic: number;
    diastolic: number;
    pulse?: number | undefined;
}>;
export declare const BloodSugarValueSchema: z.ZodObject<{
    levelMgDl: z.ZodNumber;
    mealContext: z.ZodOptional<z.ZodEnum<["FASTING", "BEFORE_MEAL", "AFTER_MEAL", "BEDTIME"]>>;
}, "strip", z.ZodTypeAny, {
    levelMgDl: number;
    mealContext?: "FASTING" | "BEFORE_MEAL" | "AFTER_MEAL" | "BEDTIME" | undefined;
}, {
    levelMgDl: number;
    mealContext?: "FASTING" | "BEFORE_MEAL" | "AFTER_MEAL" | "BEDTIME" | undefined;
}>;
export declare const SymptomValueSchema: z.ZodObject<{
    severity: z.ZodNumber;
    symptomName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    severity: number;
    symptomName: string;
}, {
    severity: number;
    symptomName: string;
}>;
export declare const NoteValueSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
}, {
    title?: string | undefined;
}>;
export declare const HealthLogValueSchema: z.ZodUnion<[z.ZodObject<{
    amountMl: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amountMl: number;
}, {
    amountMl: number;
}>, z.ZodObject<{
    hours: z.ZodNumber;
    quality: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    hours: number;
    quality?: number | undefined;
}, {
    hours: number;
    quality?: number | undefined;
}>, z.ZodObject<{
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
}, {
    count: number;
}>, z.ZodObject<{
    weightKg: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    weightKg: number;
}, {
    weightKg: number;
}>, z.ZodObject<{
    score: z.ZodNumber;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    score: number;
    tags?: string[] | undefined;
}, {
    score: number;
    tags?: string[] | undefined;
}>, z.ZodObject<{
    systolic: z.ZodNumber;
    diastolic: z.ZodNumber;
    pulse: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    systolic: number;
    diastolic: number;
    pulse?: number | undefined;
}, {
    systolic: number;
    diastolic: number;
    pulse?: number | undefined;
}>, z.ZodObject<{
    levelMgDl: z.ZodNumber;
    mealContext: z.ZodOptional<z.ZodEnum<["FASTING", "BEFORE_MEAL", "AFTER_MEAL", "BEDTIME"]>>;
}, "strip", z.ZodTypeAny, {
    levelMgDl: number;
    mealContext?: "FASTING" | "BEFORE_MEAL" | "AFTER_MEAL" | "BEDTIME" | undefined;
}, {
    levelMgDl: number;
    mealContext?: "FASTING" | "BEFORE_MEAL" | "AFTER_MEAL" | "BEDTIME" | undefined;
}>, z.ZodObject<{
    severity: z.ZodNumber;
    symptomName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    severity: number;
    symptomName: string;
}, {
    severity: number;
    symptomName: string;
}>, z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
}, {
    title?: string | undefined;
}>]>;
export declare const CreateHealthLogSchema: z.ZodObject<{
    type: z.ZodNativeEnum<{
        readonly WATER: "WATER";
        readonly SLEEP: "SLEEP";
        readonly STEPS: "STEPS";
        readonly WEIGHT: "WEIGHT";
        readonly MOOD: "MOOD";
        readonly BLOOD_PRESSURE: "BLOOD_PRESSURE";
        readonly BLOOD_SUGAR: "BLOOD_SUGAR";
        readonly SYMPTOM: "SYMPTOM";
        readonly NOTE: "NOTE";
    }>;
    value: z.ZodRecord<z.ZodString, z.ZodAny>;
    unit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    loggedAt: z.ZodDefault<z.ZodString>;
    note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    value: Record<string, any>;
    type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
    loggedAt: string;
    unit?: string | null | undefined;
    note?: string | null | undefined;
}, {
    value: Record<string, any>;
    type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
    unit?: string | null | undefined;
    loggedAt?: string | undefined;
    note?: string | null | undefined;
}>;
export type CreateHealthLogInput = z.infer<typeof CreateHealthLogSchema>;
export declare const BulkCreateHealthLogSchema: z.ZodObject<{
    logs: z.ZodArray<z.ZodObject<{
        type: z.ZodNativeEnum<{
            readonly WATER: "WATER";
            readonly SLEEP: "SLEEP";
            readonly STEPS: "STEPS";
            readonly WEIGHT: "WEIGHT";
            readonly MOOD: "MOOD";
            readonly BLOOD_PRESSURE: "BLOOD_PRESSURE";
            readonly BLOOD_SUGAR: "BLOOD_SUGAR";
            readonly SYMPTOM: "SYMPTOM";
            readonly NOTE: "NOTE";
        }>;
        value: z.ZodRecord<z.ZodString, z.ZodAny>;
        unit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        loggedAt: z.ZodDefault<z.ZodString>;
        note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        value: Record<string, any>;
        type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
        loggedAt: string;
        unit?: string | null | undefined;
        note?: string | null | undefined;
    }, {
        value: Record<string, any>;
        type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
        unit?: string | null | undefined;
        loggedAt?: string | undefined;
        note?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    logs: {
        value: Record<string, any>;
        type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
        loggedAt: string;
        unit?: string | null | undefined;
        note?: string | null | undefined;
    }[];
}, {
    logs: {
        value: Record<string, any>;
        type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
        unit?: string | null | undefined;
        loggedAt?: string | undefined;
        note?: string | null | undefined;
    }[];
}>;
export type BulkCreateHealthLogInput = z.infer<typeof BulkCreateHealthLogSchema>;
export declare const CreateGoalSchema: z.ZodObject<{
    type: z.ZodNativeEnum<{
        readonly WATER: "WATER";
        readonly SLEEP: "SLEEP";
        readonly STEPS: "STEPS";
        readonly WEIGHT: "WEIGHT";
        readonly MOOD: "MOOD";
        readonly BLOOD_PRESSURE: "BLOOD_PRESSURE";
        readonly BLOOD_SUGAR: "BLOOD_SUGAR";
        readonly SYMPTOM: "SYMPTOM";
        readonly NOTE: "NOTE";
    }>;
    targetValue: z.ZodNumber;
    period: z.ZodDefault<z.ZodNativeEnum<{
        readonly DAILY: "DAILY";
        readonly WEEKLY: "WEEKLY";
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
    targetValue: number;
    period: "DAILY" | "WEEKLY";
}, {
    type: "WATER" | "SLEEP" | "STEPS" | "WEIGHT" | "MOOD" | "BLOOD_PRESSURE" | "BLOOD_SUGAR" | "SYMPTOM" | "NOTE";
    targetValue: number;
    period?: "DAILY" | "WEEKLY" | undefined;
}>;
export type CreateGoalInput = z.infer<typeof CreateGoalSchema>;
export declare const MedicineScheduleSchema: z.ZodObject<{
    times: z.ZodArray<z.ZodString, "many">;
    daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    times: string[];
    daysOfWeek?: number[] | undefined;
}, {
    times: string[];
    daysOfWeek?: number[] | undefined;
}>;
export declare const CreateMedicineSchema: z.ZodObject<{
    name: z.ZodString;
    dose: z.ZodString;
    form: z.ZodDefault<z.ZodString>;
    schedule: z.ZodObject<{
        times: z.ZodArray<z.ZodString, "many">;
        daysOfWeek: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        times: string[];
        daysOfWeek?: number[] | undefined;
    }, {
        times: string[];
        daysOfWeek?: number[] | undefined;
    }>;
    startDate: z.ZodDefault<z.ZodString>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    dose: string;
    form: string;
    schedule: {
        times: string[];
        daysOfWeek?: number[] | undefined;
    };
    startDate: string;
    endDate?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    dose: string;
    schedule: {
        times: string[];
        daysOfWeek?: number[] | undefined;
    };
    form?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export type CreateMedicineInput = z.infer<typeof CreateMedicineSchema>;
export declare const RecordMedicineEventSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        readonly PENDING: "PENDING";
        readonly TAKEN: "TAKEN";
        readonly SKIPPED: "SKIPPED";
        readonly MISSED: "MISSED";
        readonly SNOOZED: "SNOOZED";
    }>;
    scheduledAt: z.ZodString;
    actedAt: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "TAKEN" | "SKIPPED" | "MISSED" | "SNOOZED";
    scheduledAt: string;
    actedAt: string;
}, {
    status: "PENDING" | "TAKEN" | "SKIPPED" | "MISSED" | "SNOOZED";
    scheduledAt: string;
    actedAt?: string | undefined;
}>;
export type RecordMedicineEventInput = z.infer<typeof RecordMedicineEventSchema>;
export declare const CreateReminderSchema: z.ZodObject<{
    kind: z.ZodNativeEnum<{
        readonly MEDICINE: "MEDICINE";
        readonly WATER: "WATER";
        readonly EXERCISE: "EXERCISE";
        readonly SLEEP: "SLEEP";
        readonly APPOINTMENT: "APPOINTMENT";
        readonly CUSTOM: "CUSTOM";
    }>;
    title: z.ZodString;
    body: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    rrule: z.ZodString;
    timezone: z.ZodDefault<z.ZodString>;
    channels: z.ZodArray<z.ZodNativeEnum<{
        readonly IN_APP: "IN_APP";
        readonly PUSH: "PUSH";
        readonly EMAIL: "EMAIL";
    }>, "many">;
    medicineId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    appointmentId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    title: string;
    kind: "WATER" | "SLEEP" | "MEDICINE" | "EXERCISE" | "APPOINTMENT" | "CUSTOM";
    rrule: string;
    channels: ("IN_APP" | "PUSH" | "EMAIL")[];
    body?: string | null | undefined;
    medicineId?: string | null | undefined;
    appointmentId?: string | null | undefined;
}, {
    title: string;
    kind: "WATER" | "SLEEP" | "MEDICINE" | "EXERCISE" | "APPOINTMENT" | "CUSTOM";
    rrule: string;
    channels: ("IN_APP" | "PUSH" | "EMAIL")[];
    timezone?: string | undefined;
    body?: string | null | undefined;
    medicineId?: string | null | undefined;
    appointmentId?: string | null | undefined;
}>;
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;
export declare const CreateAppointmentSchema: z.ZodObject<{
    title: z.ZodString;
    doctor: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    scheduledAt: z.ZodString;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    reminderOffsetMinutes: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    scheduledAt: string;
    notes?: string | null | undefined;
    doctor?: string | null | undefined;
    location?: string | null | undefined;
    reminderOffsetMinutes?: number | null | undefined;
}, {
    title: string;
    scheduledAt: string;
    notes?: string | null | undefined;
    doctor?: string | null | undefined;
    location?: string | null | undefined;
    reminderOffsetMinutes?: number | null | undefined;
}>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export declare const PushSubscriptionSchema: z.ZodObject<{
    endpoint: z.ZodString;
    keys: z.ZodObject<{
        p256dh: z.ZodString;
        auth: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        p256dh: string;
        auth: string;
    }, {
        p256dh: string;
        auth: string;
    }>;
}, "strip", z.ZodTypeAny, {
    keys: {
        p256dh: string;
        auth: string;
    };
    endpoint: string;
}, {
    keys: {
        p256dh: string;
        auth: string;
    };
    endpoint: string;
}>;
export type PushSubscriptionInput = z.infer<typeof PushSubscriptionSchema>;
export declare const AssistantChatSchema: z.ZodObject<{
    message: z.ZodString;
    locale: z.ZodDefault<z.ZodEnum<["en", "hi"]>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    locale: "en" | "hi";
}, {
    message: string;
    locale?: "en" | "hi" | undefined;
}>;
export type AssistantChatInput = z.infer<typeof AssistantChatSchema>;
export declare const DeleteAccountSchema: z.ZodObject<{
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
}, {
    password: string;
}>;
export type DeleteAccountInput = z.infer<typeof DeleteAccountSchema>;
//# sourceMappingURL=schemas.d.ts.map