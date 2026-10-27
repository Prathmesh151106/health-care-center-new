import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const KEY_VERSION = 'v1';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM
const AUTH_TAG_LENGTH = 16;

let encryptionKey: Buffer | null = null;

function getKey(): Buffer {
  if (!encryptionKey) {
    if (!env.FIELD_ENCRYPTION_KEY || env.FIELD_ENCRYPTION_KEY.length !== 64) {
      throw new Error('FIELD_ENCRYPTION_KEY must be a 64-character hexadecimal string');
    }
    encryptionKey = Buffer.from(env.FIELD_ENCRYPTION_KEY, 'hex');
  }
  return encryptionKey;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Formats output as: "v1:iv_hex:authTag_hex:cipher_hex"
 */
export function encryptField(plainText: string | null | undefined): string | null {
  if (plainText === null || plainText === undefined || plainText === '') {
    return null;
  }

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${KEY_VERSION}:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a formatted AES-256-GCM payload.
 */
export function decryptField(encryptedPayload: string | null | undefined): string | null {
  if (!encryptedPayload) {
    return null;
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 4) {
    // If not matching our encryption format, return original or null to avoid crashing
    return encryptedPayload;
  }

  const [version, ivHex, authTagHex, cipherHex] = parts;
  if (version !== KEY_VERSION) {
    throw new Error(`Unsupported key/payload version: ${version}`);
  }

  const key = getKey();
  const iv = Buffer.from(ivHex!, 'hex');
  const authTag = Buffer.from(authTagHex!, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(cipherHex!, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Creates a deterministic SHA-256 hash (e.g. for refresh tokens or password reset tokens).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
