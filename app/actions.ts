"use server";

import { createHash } from "crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isDemoMode, safeNextPath } from "@/lib/config";
import { parseGalleryLines } from "@/lib/gallery";
import { tooMany } from "@/lib/rate-limit";
import { clearDemoSession, getSession, getViewerKey, setDemoSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { zonedLocalToUtc } from "@/lib/time";
import {
  cleanMultiline,
  cleanText,
  validateCategory,
  validateEmail,
  validatePassword,
  validateWebsite,
} from "@/lib/validators";
import type { ReactionKind, Status } from "@/lib/types";

async function clientHash(): Promise<string> {
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return createHash("sha256").update(`naath-preview:${ip}`).digest("hex").slice(0, 20);
}

export async function signInAction(_prev: { error: string }, formData: FormData): Promise<{ error: string }> {
  const email = validateEmail(String(formData.get("email") || ""));
  const password = String(formData.get("password") || "");
  if (!email || !validatePassword(password)) return { error: "Enter the email and password." };
  const store = await getStore();
  const result = await store.authenticate(email, password);
  if (!result.ok) return { error: result.error };
  if (isDemoMode()) await setDemoSession(result.data.id);
  redirect(safeNextPath(String(formData.get("next") || "/account")));
}

export async function signOutAction(): Promise<void> {
  if (isDemoMode()) {
    await clearDemoSession();
  } else {
    const { signOutSupabase } = await import("@/lib/supabase-store");
    await signOutSupabase();
  }
  redirect("/");
}

export async function signUpAction(_prev: { error: string }, formData: FormData): Promise<{ error: string }> {
  if (await tooMany(`signup:${await clientHash()}`, 5, 60 * 60 * 1000)) {
    return { error: "Too many applications from this network just now. Try again later." };
  }
  if (formData.get("ack") !== "yes") {
    return { error: "Confirm that you understand the application stays pending until an admin approves it." };
  }
  const email = validateEmail(String(formData.get("email") || ""));
  const password = validatePassword(String(formData.get("password") || ""));
  const fullName = cleanText(String(formData.get("fullName") || ""), 80);
  const businessName = cleanText(String(formData.get("businessName") || ""), 120);
  const profession = cleanText(String(formData.get("profession") || ""), 120);
  const serviceArea = cleanText(String(formData.get("serviceArea") || ""), 120);
  const bio = cleanMultiline(String(formData.get("bio") || ""), 1000);
  const website = validateWebsite(String(formData.get("website") || ""));
  const publicContact = cleanText(String(formData.get("publicContact") || ""), 160);
  if (!email || !password || fullName.length < 2 || businessName.length < 2 || profession.length < 2 || serviceArea.length < 2 || bio.length < 10 || website === null) {
    return { error: "Check the form. The description needs at least a short sentence, and a website must start with http:// or https://." };
  }
  const store = await getStore();
  const result = await store.signUp({
    email,
    password,
    fullName,
    businessName,
    profession,
    serviceArea,
    bio,
    website,
    publicContact,
  });
  if (!result.ok) return { error: result.error };
  if (isDemoMode()) await setDemoSession(result.data.userId);
  redirect("/account?notice=submitted");
}

export async function createEventAction(_prev: { error: string }, formData: FormData): Promise<{ error: string }> {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  if (await tooMany(`event:${session.id}`, 10, 24 * 60 * 60 * 1000)) {
    return { error: "That is enough events for today. Try again tomorrow." };
  }
  const title = cleanText(String(formData.get("title") || ""), 120);
  const summary = cleanText(String(formData.get("summary") || ""), 280);
  const body = cleanMultiline(String(formData.get("body") || ""), 4000);
  const locationLabel = cleanText(String(formData.get("locationLabel") || ""), 160);
  let startsAt = "";
  try {
    startsAt = zonedLocalToUtc(String(formData.get("startsAt") || ""), "America/Chicago").toISOString();
  } catch {
    return { error: "Enter the date and time of the event." };
  }
  if (title.length < 4 || summary.length < 8 || body.length < 10 || locationLabel.length < 3) {
    return { error: "Add a title, a short summary, the details, and where people should picture it happening." };
  }
  const store = await getStore();
  const result = await store.createEvent({
    professionalId: session.id,
    title,
    summary,
    body,
    startsAt,
    locationLabel,
  });
  if (!result.ok) return { error: result.error };
  redirect("/account?notice=event");
}

async function reviewProfessional(status: Status, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin?error=invalid");
  const store = await getStore();
  const result = await store.setProfessionalStatus(session.id, id, status, cleanText(String(formData.get("note") || ""), 500));
  redirect(result.ok ? "/admin?notice=saved" : "/admin?error=invalid");
}

async function reviewEvent(status: Status, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin");
  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin?error=invalid");
  const store = await getStore();
  const result = await store.setEventStatus(session.id, id, status, cleanText(String(formData.get("note") || ""), 500));
  redirect(result.ok ? "/admin?notice=saved" : "/admin?error=invalid");
}

export async function approveProfessionalAction(formData: FormData): Promise<void> {
  await reviewProfessional("approved", formData);
}

export async function rejectProfessionalAction(formData: FormData): Promise<void> {
  await reviewProfessional("rejected", formData);
}

export async function pendProfessionalAction(formData: FormData): Promise<void> {
  await reviewProfessional("pending", formData);
}

export async function approveEventAction(formData: FormData): Promise<void> {
  await reviewEvent("approved", formData);
}

export async function rejectEventAction(formData: FormData): Promise<void> {
  await reviewEvent("rejected", formData);
}

export async function pendEventAction(formData: FormData): Promise<void> {
  await reviewEvent("pending", formData);
}

export async function featureProfessionalAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login?next=/admin");
  const category = validateCategory(String(formData.get("category") || ""));
  if (category === null) redirect("/admin?error=category");
  const parsed = parseGalleryLines(String(formData.get("gallery") || ""));
  if (parsed.rejected > 0) redirect("/admin?error=gallery");
  const store = await getStore();
  const result = await store.updateConsultation(session.id, String(formData.get("id") || ""), {
    category,
    categoryLabel: cleanText(String(formData.get("categoryLabel") || ""), 80),
    featured: formData.get("featured") === "yes",
    headline: cleanText(String(formData.get("headline") || ""), 140),
    specialty: cleanText(String(formData.get("specialty") || ""), 160),
    credentials: cleanText(String(formData.get("credentials") || ""), 240),
    contactNote: cleanText(String(formData.get("contactNote") || ""), 160),
    gallery: parsed.images,
  });
  if (!result.ok) redirect(result.error.includes("category") ? "/admin?error=category" : "/admin?error=invalid");
  redirect("/admin?notice=saved");
}

export async function recordViewAction(eventId: string): Promise<{ viewCount: number }> {
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) return { viewCount: 0 };
  const session = await getSession();
  const viewerKey = await getViewerKey(session?.id ?? null);
  if (tooMany(`view:${viewerKey}`, 40, 10 * 60 * 1000)) {
    const store = await getStore();
    const event = await store.getPublicEvent(eventId, session?.id ?? null);
    return { viewCount: event?.viewCount ?? 0 };
  }
  const store = await getStore();
  const result = await store.recordView(eventId, viewerKey, session?.id ?? null);
  return { viewCount: result.viewCount };
}

export async function toggleReactionAction(
  eventId: string,
  kind: ReactionKind,
): Promise<{ ok: true; likeCount: number; heartCount: number; viewerHasLike: boolean; viewerHasHeart: boolean } | { ok: false; error: string }> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sign in with an approved account to react." };
  if (tooMany(`react:${session.id}`, 30, 10 * 60 * 1000)) {
    return { ok: false, error: "Slow down a moment, then try the reaction again." };
  }
  if (kind !== "like" && kind !== "heart") return { ok: false, error: "That reaction is not available." };
  const store = await getStore();
  const result = await store.toggleReaction(eventId, session.id, kind);
  if (!result.ok) return result;
  return { ok: true, ...result.data };
}
