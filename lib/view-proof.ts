import { createHmac, timingSafeEqual } from "crypto";

export function viewProof(secret: string, viewerKey: string, eventId: string, day: string): string {
  return createHmac("sha256", secret).update(`${viewerKey}|${eventId}|${day}`).digest("hex");
}

export function proofsMatch(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
