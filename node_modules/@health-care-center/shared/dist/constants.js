"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.AssistantRole = exports.ReminderChannel = exports.ReminderKind = exports.MedicineStatus = exports.GoalPeriod = exports.LogType = void 0;
exports.LogType = {
    WATER: 'WATER',
    SLEEP: 'SLEEP',
    STEPS: 'STEPS',
    WEIGHT: 'WEIGHT',
    MOOD: 'MOOD',
    BLOOD_PRESSURE: 'BLOOD_PRESSURE',
    BLOOD_SUGAR: 'BLOOD_SUGAR',
    SYMPTOM: 'SYMPTOM',
    NOTE: 'NOTE'
};
exports.GoalPeriod = {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY'
};
exports.MedicineStatus = {
    PENDING: 'PENDING',
    TAKEN: 'TAKEN',
    SKIPPED: 'SKIPPED',
    MISSED: 'MISSED',
    SNOOZED: 'SNOOZED'
};
exports.ReminderKind = {
    MEDICINE: 'MEDICINE',
    WATER: 'WATER',
    EXERCISE: 'EXERCISE',
    SLEEP: 'SLEEP',
    APPOINTMENT: 'APPOINTMENT',
    CUSTOM: 'CUSTOM'
};
exports.ReminderChannel = {
    IN_APP: 'IN_APP',
    PUSH: 'PUSH',
    EMAIL: 'EMAIL'
};
exports.AssistantRole = {
    USER: 'user',
    ASSISTANT: 'assistant',
    SYSTEM: 'system'
};
exports.ErrorCode = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};
//# sourceMappingURL=constants.js.map