export const LogType = {
  WATER: 'WATER',
  SLEEP: 'SLEEP',
  STEPS: 'STEPS',
  WEIGHT: 'WEIGHT',
  MOOD: 'MOOD',
  BLOOD_PRESSURE: 'BLOOD_PRESSURE',
  BLOOD_SUGAR: 'BLOOD_SUGAR',
  SYMPTOM: 'SYMPTOM',
  NOTE: 'NOTE'
} as const;

export type LogType = (typeof LogType)[keyof typeof LogType];

export const GoalPeriod = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY'
} as const;

export type GoalPeriod = (typeof GoalPeriod)[keyof typeof GoalPeriod];

export const MedicineStatus = {
  PENDING: 'PENDING',
  TAKEN: 'TAKEN',
  SKIPPED: 'SKIPPED',
  MISSED: 'MISSED',
  SNOOZED: 'SNOOZED'
} as const;

export type MedicineStatus = (typeof MedicineStatus)[keyof typeof MedicineStatus];

export const ReminderKind = {
  MEDICINE: 'MEDICINE',
  WATER: 'WATER',
  EXERCISE: 'EXERCISE',
  SLEEP: 'SLEEP',
  APPOINTMENT: 'APPOINTMENT',
  CUSTOM: 'CUSTOM'
} as const;

export type ReminderKind = (typeof ReminderKind)[keyof typeof ReminderKind];

export const ReminderChannel = {
  IN_APP: 'IN_APP',
  PUSH: 'PUSH',
  EMAIL: 'EMAIL'
} as const;

export type ReminderChannel = (typeof ReminderChannel)[keyof typeof ReminderChannel];

export const AssistantRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const;

export type AssistantRole = (typeof AssistantRole)[keyof typeof AssistantRole];

export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
