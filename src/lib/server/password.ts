import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex");

  return `scrypt$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [algorithm, salt, storedDerivedKey] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedDerivedKey) {
    return false;
  }

  const derivedKey = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const storedBuffer = Buffer.from(storedDerivedKey, "hex");

  if (derivedKey.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, storedBuffer);
}
