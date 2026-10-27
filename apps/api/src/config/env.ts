import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URI'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid Redis connection URI').default('redis://localhost:6379'),

  // Auth tokens
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(7),

  // CORS & Security
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  FIELD_ENCRYPTION_KEY: z.string().min(64, 'FIELD_ENCRYPTION_KEY must be a 64-character hex string (32 bytes) for AES-256-GCM'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),

  // Web Push (Optional group)
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().optional(),

  // Email / SMTP (Optional group)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@healthcompanion.local'),

  // AI Wellness Assistant (Optional group)
  LLM_PROVIDER: z.enum(['mock', 'gemini', 'openai']).default('mock'),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().default('gemini-1.5-flash'),

  // Operational controls & Feature flags
  RATE_LIMIT_AUTH_PER_MINUTE: z.coerce.number().default(10),
  RATE_LIMIT_GLOBAL_PER_MINUTE: z.coerce.number().default(100),
  RATE_LIMIT_ASSISTANT_PER_MINUTE: z.coerce.number().default(15),
  ENABLE_EMAIL_VERIFICATION: z.coerce.boolean().default(false),
  MISSED_DOSE_GRACE_PERIOD_MINUTES: z.coerce.number().default(120),
  AUDIT_LOG_RETENTION_DAYS: z.coerce.number().default(90),
  ASSISTANT_MESSAGE_RETENTION_DAYS: z.coerce.number().default(30)
}).superRefine((data, ctx) => {
  // Push validation: both or neither
  const hasVapidPub = !!data.VAPID_PUBLIC_KEY;
  const hasVapidPriv = !!data.VAPID_PRIVATE_KEY;
  if ((hasVapidPub && !hasVapidPriv) || (!hasVapidPub && hasVapidPriv)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Both VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be set to enable Web Push'
    });
  }

  // SMTP validation: all or none
  const hasSmtp = !!data.SMTP_HOST;
  if (hasSmtp) {
    if (!data.SMTP_PORT || !data.SMTP_USER || !data.SMTP_PASS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS must all be provided if SMTP is configured'
      });
    }
  }

  // Encryption key length verification: must be 32 bytes (64 hex characters)
  if (data.FIELD_ENCRYPTION_KEY && !/^[0-9a-fA-F]{64}$/.test(data.FIELD_ENCRYPTION_KEY)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'FIELD_ENCRYPTION_KEY must be a valid 64-character hexadecimal string (32 bytes)'
    });
  }
});

export type EnvConfig = z.infer<typeof EnvSchema>;

let validatedEnv: EnvConfig;

try {
  validatedEnv = EnvSchema.parse(process.env);
} catch (err: any) {
  if (err instanceof z.ZodError) {
    const missingOrInvalid = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    console.error(`\x1b[31m[CONFIG FATAL] Environment validation failed: ${missingOrInvalid}\x1b[0m`);
  } else {
    console.error('[CONFIG FATAL] Unknown error validating environment configuration', err);
  }
  process.exit(1);
}

export const env = validatedEnv;

export const features = {
  isPushEnabled: !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY),
  isEmailEnabled: !!(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS),
  isAiMock: env.LLM_PROVIDER === 'mock' || !env.LLM_API_KEY
};
