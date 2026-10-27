export declare const LogType: {
    readonly WATER: "WATER";
    readonly SLEEP: "SLEEP";
    readonly STEPS: "STEPS";
    readonly WEIGHT: "WEIGHT";
    readonly MOOD: "MOOD";
    readonly BLOOD_PRESSURE: "BLOOD_PRESSURE";
    readonly BLOOD_SUGAR: "BLOOD_SUGAR";
    readonly SYMPTOM: "SYMPTOM";
    readonly NOTE: "NOTE";
};
export type LogType = (typeof LogType)[keyof typeof LogType];
export declare const GoalPeriod: {
    readonly DAILY: "DAILY";
    readonly WEEKLY: "WEEKLY";
};
export type GoalPeriod = (typeof GoalPeriod)[keyof typeof GoalPeriod];
export declare const MedicineStatus: {
    readonly PENDING: "PENDING";
    readonly TAKEN: "TAKEN";
    readonly SKIPPED: "SKIPPED";
    readonly MISSED: "MISSED";
    readonly SNOOZED: "SNOOZED";
};
export type MedicineStatus = (typeof MedicineStatus)[keyof typeof MedicineStatus];
export declare const ReminderKind: {
    readonly MEDICINE: "MEDICINE";
    readonly WATER: "WATER";
    readonly EXERCISE: "EXERCISE";
    readonly SLEEP: "SLEEP";
    readonly APPOINTMENT: "APPOINTMENT";
    readonly CUSTOM: "CUSTOM";
};
export type ReminderKind = (typeof ReminderKind)[keyof typeof ReminderKind];
export declare const ReminderChannel: {
    readonly IN_APP: "IN_APP";
    readonly PUSH: "PUSH";
    readonly EMAIL: "EMAIL";
};
export type ReminderChannel = (typeof ReminderChannel)[keyof typeof ReminderChannel];
export declare const AssistantRole: {
    readonly USER: "user";
    readonly ASSISTANT: "assistant";
    readonly SYSTEM: "system";
};
export type AssistantRole = (typeof AssistantRole)[keyof typeof AssistantRole];
export declare const ErrorCode: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS";
    readonly INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR";
    readonly SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE";
};
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
//# sourceMappingURL=constants.d.ts.map