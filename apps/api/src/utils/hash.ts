import argon2 from 'argon2';

// Blocklist of common passwords
const COMMON_PASSWORDS = new Set([
  'password123',
  '1234567890',
  'qwertyuiop',
  'health1234',
  'admin12345',
  'welcome123',
  'iloveyou12',
  'password1234',
  'changeme123'
]);

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 1
  });
}

export async function verifyPassword(hash: string, plainText: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plainText);
  } catch {
    return false;
  }
}

export function isCommonPassword(password: string): boolean {
  return COMMON_PASSWORDS.has(password.toLowerCase().trim());
}
