import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { requireSupabaseEnv } from "./config";
import { cookies } from "next/headers";
import { profileToConsultation } from "./consultations";
import { utcDay } from "./time";
import { viewProof } from "./view-proof";
import type { Store } from "./sqlite-store";
import type {
  ConsultationInput,
  ConsultationProfile,
  CreateEventInput,
  EventItem,
  GalleryImage,
  Profile,
  ReactionKind,
  Result,
  Role,
  SessionUser,
  SignUpInput,
  Status,
  Testimonial,
  TestimonialInput,
} from "./types";

type Row = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function asNullable(value: unknown): string | null {
  if (value == null || value === "") return null;
  return String(value);
}

function asNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function asGallery(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const image = item as GalleryImage;
    if (!image.src || !image.alt || !image.caption) return [];
    return [{ src: image.src, alt: image.alt, caption: image.caption }];
  });
}

function mapProfile(row: Row): Profile {
  return {
    id: asString(row.id),
    email: asString(row.email),
    fullName: asString(row.full_name),
    businessName: asString(row.business_name),
    profession: asString(row.profession),
    serviceArea: asString(row.service_area),
    bio: asString(row.bio),
    website: asNullable(row.website),
    publicContact: asNullable(row.public_contact),
    status: asString(row.status) as Status,
    role: asString(row.role) as Role,
    reviewNote: asNullable(row.review_note),
    createdAt: asString(row.created_at),
    reviewedAt: asNullable(row.reviewed_at),
    consultationCategory: asNullable(row.consultation_category),
    consultationCategoryLabel: asNullable(row.consultation_category_label),
    consultationHeadline: asNullable(row.consultation_headline),
    specialty: asNullable(row.specialty),
    credentials: asNullable(row.credentials),
    contactNote: asNullable(row.contact_note),
    gallery: asGallery(row.gallery_json),
    featuredConsultation: row.featured_consultation === true,
  };
}

function embeddedProfile(value: unknown): Row {
  if (Array.isArray(value)) return (value[0] as Row) ?? {};
  if (value && typeof value === "object") return value as Row;
  return {};
}

function mapEvent(row: Row, reactions: Set<string>): EventItem {
  const host = embeddedProfile(row.profiles);
  const id = asString(row.id);
  return {
    id,
    professionalId: asString(row.professional_id),
    professionalName: asString(host.full_name),
    businessName: asString(host.business_name),
    profession: asString(host.profession),
    professionalStatus: asString(host.status) as Status,
    title: asString(row.title),
    summary: asString(row.summary),
    body: asString(row.body),
    startsAt: asString(row.starts_at),
    locationLabel: asString(row.location_label),
    status: asString(row.status) as Status,
    viewCount: asNumber(row.view_count),
    likeCount: asNumber(row.like_count),
    heartCount: asNumber(row.heart_count),
    viewerHasLike: reactions.has(`${id}:like`),
    viewerHasHeart: reactions.has(`${id}:heart`),
    reviewNote: asNullable(row.review_note),
    createdAt: asString(row.created_at),
    reviewedAt: asNullable(row.reviewed_at),
  };
}

async function supabase() {
  const { url, anonKey } = requireSupabaseEnv();
  const jar = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return jar.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => jar.set(name, value, options));
        } catch {
          // Server Components cannot always write cookies. Middleware refreshes the session.
        }
      },
    },
  });
}

const eventColumns = `
  id, professional_id, title, summary, body, starts_at, location_label, status,
  view_count, like_count, heart_count, review_note, created_at, reviewed_at,
  profiles!events_professional_id_fkey (full_name, business_name, profession, status)
`;

async function reactionSet(userId: string | null): Promise<Set<string>> {
  const set = new Set<string>();
  if (!userId) return set;
  const db = await supabase();
  const { data } = await db.from("event_reactions").select("event_id, reaction").eq("user_id", userId);
  for (const row of data ?? []) {
    set.add(`${row.event_id}:${row.reaction}`);
  }
  return set;
}

async function requireAdmin(): Promise<Result<SessionUser>> {
  const user = await currentSupabaseUser();
  if (!user || user.role !== "admin" || user.status !== "approved") {
    return { ok: false, error: "You do not have permission to do that." };
  }
  return { ok: true, data: user };
}

export async function signOutSupabase(): Promise<void> {
  const db = await supabase();
  await db.auth.signOut();
}

export async function currentSupabaseUser(): Promise<SessionUser | null> {
  const db = await supabase();
  const { data } = await db.auth.getUser();
  if (!data.user) return null;
  const { data: row } = await db.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (!row) return null;
  const profile = mapProfile(row as Row);
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    status: profile.status,
    businessName: profile.businessName,
  };
}

export function getSupabaseStore(): Store {
  return {
    async signUp(input: SignUpInput) {
      const db = await supabase();
      const { data, error } = await db.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            business_name: input.businessName,
            profession: input.profession,
            service_area: input.serviceArea,
            bio: input.bio,
            website: input.website,
            public_contact: input.publicContact,
          },
        },
      });
      if (error || !data.user) {
        const message = error?.message?.toLowerCase() ?? "";
        if (message.includes("already")) {
          return { ok: false, error: "An account with that email already exists. Sign in instead." };
        }
        return { ok: false, error: "The application could not be saved." };
      }
      await db.from("profiles").upsert(
        {
          id: data.user.id,
          email: input.email,
          full_name: input.fullName,
          business_name: input.businessName,
          profession: input.profession,
          service_area: input.serviceArea,
          bio: input.bio,
          website: input.website || null,
          public_contact: input.publicContact || null,
          status: "pending",
          role: "professional",
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
      return { ok: true, data: { userId: data.user.id } };
    },

    async authenticate(email, password) {
      const db = await supabase();
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: "Email or password does not match." };
      const user = await currentSupabaseUser();
      if (!user) return { ok: false, error: "Email or password does not match." };
      return { ok: true, data: user };
    },

    async getUser(id) {
      const db = await supabase();
      const { data } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
      if (!data) return null;
      const profile = mapProfile(data as Row);
      return {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        role: profile.role,
        status: profile.status,
        businessName: profile.businessName,
      };
    },

    async getProfile(id) {
      const db = await supabase();
      const { data } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
      return data ? mapProfile(data as Row) : null;
    },

    async listApprovedProfessionals() {
      const db = await supabase();
      const { data } = await db
        .from("profiles")
        .select("*")
        .eq("status", "approved")
        .eq("role", "professional")
        .order("business_name");
      return (data ?? []).map((row) => mapProfile(row as Row));
    },

    async listProfessionalsForAdmin() {
      const db = await supabase();
      const { data } = await db.from("profiles").select("*").eq("role", "professional").order("created_at", { ascending: false });
      return (data ?? []).map((row) => mapProfile(row as Row));
    },

    async setProfessionalStatus(_actorId, profileId, status, note) {
      const admin = await requireAdmin();
      if (!admin.ok) return admin;
      const db = await supabase();
      const patch: Row = {
        status,
        review_note: note || null,
        reviewed_at: new Date().toISOString(),
      };
      if (status !== "approved") patch.featured_consultation = false;
      const { error } = await db.from("profiles").update(patch).eq("id", profileId).eq("role", "professional");
      if (error) return { ok: false, error: "That record was not found." };
      return { ok: true, data: null };
    },

    async updateConsultation(_actorId, profileId, input: ConsultationInput) {
      const admin = await requireAdmin();
      if (!admin.ok) return admin;
      const db = await supabase();
      const existing = await db.from("profiles").select("status, role").eq("id", profileId).maybeSingle();
      if (!existing.data || existing.data.role !== "professional") {
        return { ok: false, error: "That record was not found." };
      }
      if (input.featured && existing.data.status !== "approved") {
        return { ok: false, error: "Approve the professional before featuring them." };
      }
      if (input.featured && !input.category) {
        return { ok: false, error: "Choose a category to feature this profile." };
      }
      const { error } = await db
        .from("profiles")
        .update({
          consultation_category: input.category || null,
          consultation_category_label: input.categoryLabel || null,
          consultation_headline: input.headline || null,
          specialty: input.specialty || null,
          credentials: input.credentials || null,
          contact_note: input.contactNote || null,
          gallery_json: input.gallery,
          featured_consultation: input.featured,
        })
        .eq("id", profileId);
      if (error) return { ok: false, error: "The consultation listing could not be saved." };
      return { ok: true, data: null };
    },

    async listFeaturedConsultations(): Promise<ConsultationProfile[]> {
      const db = await supabase();
      const { data } = await db
        .from("profiles")
        .select("*")
        .eq("role", "professional")
        .eq("status", "approved")
        .eq("featured_consultation", true)
        .not("consultation_category", "is", null)
        .order("business_name");
      return (data ?? []).map((row) => profileToConsultation(mapProfile(row as Row)));
    },

    async listApprovedEvents(viewerId) {
      const db = await supabase();
      const reactions = await reactionSet(viewerId);
      const { data } = await db
        .from("events")
        .select(eventColumns)
        .eq("status", "approved")
        .eq("profiles.status", "approved")
        .order("starts_at");
      return (data ?? []).map((row) => mapEvent(row as unknown as Row, reactions));
    },

    async listEventsForAdmin(viewerId) {
      const db = await supabase();
      const reactions = await reactionSet(viewerId);
      const { data } = await db.from("events").select(eventColumns).order("created_at", { ascending: false });
      return (data ?? []).map((row) => mapEvent(row as unknown as Row, reactions));
    },

    async listMyEvents(userId) {
      const db = await supabase();
      const reactions = await reactionSet(userId);
      const { data } = await db.from("events").select(eventColumns).eq("professional_id", userId).order("created_at", { ascending: false });
      return (data ?? []).map((row) => mapEvent(row as unknown as Row, reactions));
    },

    async getPublicEvent(id, viewerId) {
      const db = await supabase();
      const reactions = await reactionSet(viewerId);
      const { data } = await db
        .from("events")
        .select(eventColumns)
        .eq("id", id)
        .eq("status", "approved")
        .eq("profiles.status", "approved")
        .maybeSingle();
      return data ? mapEvent(data as unknown as Row, reactions) : null;
    },

    async createEvent(input: CreateEventInput) {
      const db = await supabase();
      const { data, error } = await db
        .from("events")
        .insert({
          professional_id: input.professionalId,
          title: input.title,
          summary: input.summary,
          body: input.body,
          starts_at: input.startsAt,
          location_label: input.locationLabel,
          status: "pending",
        })
        .select("id")
        .single();
      if (error || !data) {
        return { ok: false, error: "Approved professionals can add events. This account is not approved yet." };
      }
      return { ok: true, data: { id: asString(data.id) } };
    },

    async setEventStatus(_actorId, eventId, status, note) {
      const admin = await requireAdmin();
      if (!admin.ok) return admin;
      const db = await supabase();
      const { error } = await db
        .from("events")
        .update({ status, review_note: note || null, reviewed_at: new Date().toISOString() })
        .eq("id", eventId);
      if (error) return { ok: false, error: "That record was not found." };
      return { ok: true, data: null };
    },

    async recordView(eventId, viewerKey, _userId, viewedOn) {
      const db = await supabase();
      const day = viewedOn ?? utcDay();
      const secret = process.env.VIEW_SIGNING_SECRET || "";
      const proof = secret.length >= 16 ? viewProof(secret, viewerKey, eventId, day) : "";
      const { data, error } = await db.rpc("record_event_view", {
        p_event_id: eventId,
        p_viewer_key: viewerKey,
        p_day: day,
        p_proof: proof,
      });
      if (error || typeof data !== "number") {
        const { data: event } = await db.from("events").select("view_count").eq("id", eventId).maybeSingle();
        return { viewCount: asNumber(event?.view_count), counted: false };
      }
      return { viewCount: data, counted: true };
    },

    async toggleReaction(eventId, userId, kind: ReactionKind) {
      const db = await supabase();
      const user = await this.getUser(userId);
      if (!user || user.status !== "approved") {
        return { ok: false, error: "Reactions are open to approved accounts." };
      }
      const { data: existing } = await db
        .from("event_reactions")
        .select("reaction")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .eq("reaction", kind)
        .maybeSingle();
      if (existing) {
        const { error } = await db.from("event_reactions").delete().eq("event_id", eventId).eq("user_id", userId).eq("reaction", kind);
        if (error) return { ok: false, error: "The reaction could not be saved." };
      } else {
        const { error } = await db.from("event_reactions").insert({ event_id: eventId, user_id: userId, reaction: kind });
        if (error) return { ok: false, error: "Reactions are open to approved accounts, once each." };
      }
      const { data: event } = await db.from("events").select("like_count, heart_count").eq("id", eventId).maybeSingle();
      const reactions = await reactionSet(userId);
      return {
        ok: true,
        data: {
          likeCount: asNumber(event?.like_count),
          heartCount: asNumber(event?.heart_count),
          viewerHasLike: reactions.has(`${eventId}:like`),
          viewerHasHeart: reactions.has(`${eventId}:heart`),
        },
      };
    },

    async listTestimonials(profileId) {
      const db = await supabase();
      const { data, error } = await db
        .from("testimonials")
        .select("id, profile_id, quote, client_name, client_role, given_on")
        .eq("profile_id", profileId)
        .order("created_at", { ascending: false });
      if (error) return [];
      return (data ?? []).map((row) => mapTestimonial(row as Row));
    },

    async saveTestimonial(userId, testimonialId, input: TestimonialInput) {
      const user = await this.getUser(userId);
      if (!user || user.status !== "approved") {
        return { ok: false, error: "Only an approved account can post a testimonial on their own page." };
      }
      const db = await supabase();
      const payload = {
        quote: input.quote,
        client_name: input.clientName,
        client_role: input.clientRole || null,
        given_on: input.givenOn || null,
      };
      if (testimonialId) {
        const { error } = await db.from("testimonials").update(payload).eq("id", testimonialId).eq("profile_id", userId);
        if (error) return { ok: false, error: testimonialError(error.message) };
        return { ok: true, data: { id: testimonialId } };
      }
      const { data, error } = await db.from("testimonials").insert({ ...payload, profile_id: userId }).select("id").single();
      if (error || !data) return { ok: false, error: testimonialError(error?.message) };
      return { ok: true, data: { id: asString(data.id) } };
    },

    async deleteTestimonial(userId, testimonialId) {
      const user = await this.getUser(userId);
      if (!user || user.status !== "approved") {
        return { ok: false, error: "Only an approved account can remove a testimonial." };
      }
      const db = await supabase();
      const { error } = await db.from("testimonials").delete().eq("id", testimonialId).eq("profile_id", userId);
      if (error) return { ok: false, error: testimonialError(error.message) };
      return { ok: true, data: null };
    },
  };
}

function mapTestimonial(row: Row): Testimonial {
  return {
    id: asString(row.id),
    profileId: asString(row.profile_id),
    quote: asString(row.quote),
    clientName: asString(row.client_name),
    clientRole: asNullable(row.client_role),
    givenOn: asNullable(row.given_on),
  };
}

function testimonialError(message: string | undefined): string {
  const text = (message ?? "").toLowerCase();
  if (text.includes("does not exist") || text.includes("schema cache") || text.includes("testimonials")) {
    return "Testimonials are not available yet.";
  }
  return "The testimonial could not be saved.";
}
