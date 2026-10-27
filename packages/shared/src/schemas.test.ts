import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  WaterValueSchema,
  SleepValueSchema,
  BloodPressureValueSchema
} from '../src/schemas.js';

describe('Shared Zod Schemas Validation', () => {
  it('validates correct registration payload', () => {
    const valid = {
      email: 'user@example.com',
      password: 'StrongPassword123!',
      name: 'John Doe',
      timezone: 'Asia/Kolkata',
      locale: 'en'
    };
    const parsed = RegisterSchema.parse(valid);
    expect(parsed.email).toBe('user@example.com');
  });

  it('rejects passwords under 10 characters', () => {
    const invalid = {
      email: 'user@example.com',
      password: 'short',
      name: 'John Doe'
    };
    expect(() => RegisterSchema.parse(invalid)).toThrow();
  });

  it('validates health metrics bounds', () => {
    expect(() => WaterValueSchema.parse({ amountMl: 500 })).not.toThrow();
    expect(() => SleepValueSchema.parse({ hours: 7.5 })).not.toThrow();
    expect(() => SleepValueSchema.parse({ hours: 25 })).toThrow(); // > 24h
    expect(() => BloodPressureValueSchema.parse({ systolic: 120, diastolic: 80 })).not.toThrow();
  });
});
