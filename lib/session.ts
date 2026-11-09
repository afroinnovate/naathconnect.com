import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { isDemoMode } from "./config";
import type { SessionUser } from "./types";

const COOKIE = "nc_session";
const FOURTEEN_DAYS = 60 * 60 * 24 * 14;

function demoSecret(): string {
  if (process.env.DEMO_SESSION_SECRET && process.env.DEMO_SESSION_SECRET.length >= 16) {
    return process.env.DEMO_SESSION_SECRET;
  }
  const file = path.join(process.cwd(), "data", "demo-session-secret");
  if (fs.existsSync(file)) return fs.readFileSync(file, "utf8").trim();
  const secret = randomBytes(32).toString("hex");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

function sign(userId: string): string {
  const body = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + FOURTEEN_DAYS * 1000 })).toString("base64url");
  const sig = createHmac("sha256", demoSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readUserId(token: string | undefined): string | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", demoSecret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString()) as { uid?: string; exp?: number };
    if (!parsed.uid || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed.uid;
  } catch {
    return null;
  }
}

export async function setDemoSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: FOURTEEN_DAYS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearDemoSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    const jar = await cookies();
    const userId = readUserId(jar.get(COOKIE)?.value);
    if (!userId) return null;
    const { getSqliteStore } = await import("./sqlite-store");
    return await getSqliteStore().getUser(userId);
  }
  const { currentSupabaseUser } = await import("./supabase-store");
  return currentSupabaseUser();
}

export async function getViewerKey(userId: string | null): Promise<string> {
  if (userId) return createHash("sha256").update(`user:${userId}`).digest("hex").slice(0, 40);
  const vid = await viewerCookie();
  return createHash("sha256").update(`cookie:${vid}`).digest("hex").slice(0, 40);
}

export async function viewerCookie(): Promise<string> {
  const jar = await cookies();
  let vid = jar.get("nc_vid")?.value;
  if (!vid || !/^[a-f0-9]{32}$/.test(vid)) {
    vid = randomBytes(16).toString("hex");
    jar.set("nc_vid", vid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 400,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return vid;
}
