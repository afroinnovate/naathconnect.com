import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

function scryptCost(): number {
  const configured = Number(process.env.DEMO_SCRYPT_N || 16384);
  if (!Number.isFinite(configured) || configured < 1024) return 16384;
  return configured;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32, { N: scryptCost(), r: 8, p: 1 }).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 32, { N: scryptCost(), r: 8, p: 1 });
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
