import fs from "fs";
import path from "path";
import { profileToConsultation } from "./consultations";
import { demoAdminEmail, demoAdminPassword, demoProfessionalPassword } from "./config";
import { sanitizeGallery } from "./gallery";
import { hashPassword, verifyPassword } from "./passwords";
import { zonedLocalToUtc } from "./time";
import { utcDay } from "./time";
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
} from "./types";

type SqlRow = Record<string, string | number | bigint | null | Uint8Array>;

type SqliteModule = {
  DatabaseSync: new (path: string) => {
    exec(sql: string): void;
    prepare(sql: string): {
      get(...params: Array<string | number | null>): SqlRow | undefined;
      all(...params: Array<string | number | null>): SqlRow[];
      run(...params: Array<string | number | null>): { changes: number | bigint };
    };
  };
};

function loadSqlite(): SqliteModule {
  // Runtime-only load so the production bundle never static-links node:sqlite.
  // Amplify does not call this. Local demo mode does.
  const specifier = ["node", "sqlite"].join(":");
  const nodeModule = (
    process as NodeJS.Process & { getBuiltinModule?: (id: string) => typeof import("node:module") }
  ).getBuiltinModule?.("node:module");
  if (!nodeModule) {
    throw new Error("The local SQLite demo needs Node 22. It is not available on Amplify.");
  }
  return nodeModule.createRequire(path.join(process.cwd(), "package.json"))(specifier) as SqliteModule;
}

const IDS = {
  admin: "00000000-0000-4000-8000-000000000001",
  proOne: "00000000-0000-4000-8000-000000000002",
  proTwo: "00000000-0000-4000-8000-000000000003",
  applicant: "00000000-0000-4000-8000-000000000004",
  rejected: "00000000-0000-4000-8000-000000000005",
  eventOne: "00000000-0000-4000-8000-000000000011",
  eventTwo: "00000000-0000-4000-8000-000000000012",
  eventThree: "00000000-0000-4000-8000-000000000013",
  eventPending: "00000000-0000-4000-8000-000000000014",
};

function text(row: SqlRow, key: string): string {
  const value = row[key];
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

function nullable(row: SqlRow, key: string): string | null {
  const value = row[key];
  if (value == null || value === "") return null;
  return String(value);
}

function integer(row: SqlRow, key: string): number {
  const value = row[key];
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  return Number(value ?? 0);
}

function parseGallery(raw: string | null): GalleryImage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as GalleryImage[];
    if (!Array.isArray(parsed)) return [];
    return sanitizeGallery(parsed);
  } catch {
    return [];
  }
}

function mapProfile(row: SqlRow): Profile {
  return {
    id: text(row, "id"),
    email: text(row, "email"),
    fullName: text(row, "full_name"),
    businessName: text(row, "business_name"),
    profession: text(row, "profession"),
    serviceArea: text(row, "service_area"),
    bio: text(row, "bio"),
    website: nullable(row, "website"),
    publicContact: nullable(row, "public_contact"),
    status: text(row, "status") as Status,
    role: text(row, "role") as Role,
    reviewNote: nullable(row, "review_note"),
    createdAt: text(row, "created_at"),
    reviewedAt: nullable(row, "reviewed_at"),
    consultationCategory: nullable(row, "consultation_category"),
    consultationCategoryLabel: nullable(row, "consultation_category_label"),
    consultationHeadline: nullable(row, "consultation_headline"),
    specialty: nullable(row, "specialty"),
    credentials: nullable(row, "credentials"),
    contactNote: nullable(row, "contact_note"),
    gallery: parseGallery(nullable(row, "gallery_json")),
    featuredConsultation: integer(row, "featured_consultation") === 1,
  };
}

function mapEvent(row: SqlRow): EventItem {
  return {
    id: text(row, "id"),
    professionalId: text(row, "professional_id"),
    professionalName: text(row, "professional_name"),
    businessName: text(row, "business_name"),
    profession: text(row, "profession"),
    professionalStatus: text(row, "professional_status") as Status,
    title: text(row, "title"),
    summary: text(row, "summary"),
    body: text(row, "body"),
    startsAt: text(row, "starts_at"),
    locationLabel: text(row, "location_label"),
    status: text(row, "status") as Status,
    viewCount: integer(row, "view_count"),
    likeCount: integer(row, "like_count"),
    heartCount: integer(row, "heart_count"),
    viewerHasLike: integer(row, "viewer_has_like") === 1,
    viewerHasHeart: integer(row, "viewer_has_heart") === 1,
    reviewNote: nullable(row, "review_note"),
    createdAt: text(row, "created_at"),
    reviewedAt: nullable(row, "reviewed_at"),
  };
}

const EVENT_SELECT = `
  select
    e.id, e.professional_id, e.title, e.summary, e.body, e.starts_at, e.location_label,
    e.status, e.view_count, e.like_count, e.heart_count, e.review_note, e.created_at, e.reviewed_at,
    p.full_name as professional_name, p.business_name, p.profession, p.status as professional_status,
    case when exists (
      select 1 from event_reactions r
      where r.event_id = e.id and r.user_id = ? and r.reaction = 'like'
    ) then 1 else 0 end as viewer_has_like,
    case when exists (
      select 1 from event_reactions r
      where r.event_id = e.id and r.user_id = ? and r.reaction = 'heart'
    ) then 1 else 0 end as viewer_has_heart
  from events e
  join profiles p on p.id = e.professional_id
`;

type Maybe<T> = T | Promise<T>;

export type Store = {
  signUp(input: SignUpInput): Maybe<Result<{ userId: string }>>;
  authenticate(email: string, password: string): Maybe<Result<SessionUser>>;
  getUser(id: string): Maybe<SessionUser | null>;
  getProfile(id: string): Maybe<Profile | null>;
  listApprovedProfessionals(): Maybe<Profile[]>;
  listProfessionalsForAdmin(): Maybe<Profile[]>;
  setProfessionalStatus(actorId: string, profileId: string, status: Status, note: string): Maybe<Result<null>>;
  updateConsultation(actorId: string, profileId: string, input: ConsultationInput): Maybe<Result<null>>;
  listFeaturedConsultations(): Maybe<ConsultationProfile[]>;
  listApprovedEvents(viewerId: string | null): Maybe<EventItem[]>;
  listEventsForAdmin(viewerId: string | null): Maybe<EventItem[]>;
  listMyEvents(userId: string): Maybe<EventItem[]>;
  getPublicEvent(id: string, viewerId: string | null): Maybe<EventItem | null>;
  createEvent(input: CreateEventInput): Maybe<Result<{ id: string }>>;
  setEventStatus(actorId: string, eventId: string, status: Status, note: string): Maybe<Result<null>>;
  recordView(
    eventId: string,
    viewerKey: string,
    userId: string | null,
    viewedOn?: string,
  ): Maybe<{ viewCount: number; counted: boolean }>;
  toggleReaction(
    eventId: string,
    userId: string,
    kind: ReactionKind,
  ): Maybe<Result<Pick<EventItem, "likeCount" | "heartCount" | "viewerHasLike" | "viewerHasHeart">>>;
};

function sessionFromProfile(profile: Profile): SessionUser {
  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.fullName,
    role: profile.role,
    status: profile.status,
    businessName: profile.businessName,
  };
}

export function openSqliteStore(filename: string): Store {
  const db = new (loadSqlite().DatabaseSync)(filename);
  db.exec("PRAGMA foreign_keys = ON");
  if (filename !== ":memory:") db.exec("PRAGMA journal_mode = WAL");
  const schema = fs.readFileSync(path.join(process.cwd(), "lib/demo/schema.sql"), "utf8");
  db.exec(schema);

  const transaction = <T,>(fn: () => T): T => {
    db.exec("BEGIN");
    try {
      const result = fn();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      try {
        db.exec("ROLLBACK");
      } catch {
        // already rolled back
      }
      throw error;
    }
  };

  const profileById = (id: string): Profile | null => {
    const row = db.prepare("select * from profiles where id = ?").get(id);
    return row ? mapProfile(row) : null;
  };

  const requireAdmin = (actorId: string): Result<Profile> => {
    const actor = profileById(actorId);
    if (!actor || actor.role !== "admin" || actor.status !== "approved") {
      return { ok: false, error: "You do not have permission to do that." };
    }
    return { ok: true, data: actor };
  };

  const selectEvents = (where: string, params: Array<string | number>, viewerId: string | null): EventItem[] => {
    const viewer = viewerId ?? "";
    const rows = db.prepare(`${EVENT_SELECT} ${where}`).all(viewer, viewer, ...params);
    return rows.map(mapEvent);
  };

  const refreshCounts = (eventId: string) => {
    db.prepare(
      `update events set
        view_count = (select count(*) from event_views where event_id = ?),
        like_count = (select count(*) from event_reactions where event_id = ? and reaction = 'like'),
        heart_count = (select count(*) from event_reactions where event_id = ? and reaction = 'heart')
      where id = ?`,
    ).run(eventId, eventId, eventId, eventId);
  };

  const seed = () => {
    const existing = db.prepare("select count(*) as n from profiles").get();
    if (existing && integer(existing, "n") > 0) return;
    const now = "2026-11-01T15:00:00.000Z";
    const adminPassword = hashPassword(demoAdminPassword());
    const professionalPassword = hashPassword(demoProfessionalPassword());
    const insertProfile = db.prepare(
      `insert into profiles (
        id, email, full_name, business_name, profession, service_area, bio, website, public_contact,
        status, role, review_note, created_at, reviewed_at, gallery_json, featured_consultation
      ) values (?, ?, ?, ?, ?, ?, ?, null, null, ?, ?, ?, ?, ?, '[]', 0)`,
    );
    const insertCredential = db.prepare("insert into credentials (user_id, password_hash) values (?, ?)");
    const people: Array<{
      id: string;
      email: string;
      fullName: string;
      businessName: string;
      profession: string;
      serviceArea: string;
      bio: string;
      status: Status;
      role: Role;
      reviewNote: string | null;
      reviewedAt: string | null;
    }> = [
      {
        id: IDS.admin,
        email: demoAdminEmail(),
        fullName: "Tango Tew",
        businessName: "Naath Connect LLC",
        profession: "Technology consultant",
        serviceArea: "Iowa",
        bio: "PLACEHOLDER login for the owner admin. This inbox is not a real mailbox.",
        status: "approved",
        role: "admin",
        reviewNote: null,
        reviewedAt: now,
      },
      {
        id: IDS.proOne,
        email: "placeholder-pro-one@example.invalid",
        fullName: "Placeholder Professional One",
        businessName: "Placeholder Community Workshop",
        profession: "Community workshop facilitation",
        serviceArea: "Placeholder region",
        bio: "PLACEHOLDER profile for layout review. This is not a real business, client, or testimonial.",
        status: "approved",
        role: "professional",
        reviewNote: "Approved for the preview directory only.",
        reviewedAt: now,
      },
      {
        id: IDS.proTwo,
        email: "placeholder-pro-two@example.invalid",
        fullName: "Placeholder Professional Two",
        businessName: "Placeholder Contractor Desk",
        profession: "Contractor introductions",
        serviceArea: "Placeholder region",
        bio: "PLACEHOLDER profile for layout review. This is not a real contractor or client.",
        status: "approved",
        role: "professional",
        reviewNote: "Approved for the preview directory only.",
        reviewedAt: now,
      },
      {
        id: IDS.applicant,
        email: "placeholder-applicant@example.invalid",
        fullName: "Placeholder Applicant",
        businessName: "Placeholder Pending Practice",
        profession: "Bookkeeping",
        serviceArea: "Placeholder region",
        bio: "PLACEHOLDER application. It stays off the public directory until an admin approves it.",
        status: "pending",
        role: "professional",
        reviewNote: null,
        reviewedAt: null,
      },
      {
        id: IDS.rejected,
        email: "placeholder-rejected@example.invalid",
        fullName: "Placeholder Rejected Applicant",
        businessName: "Placeholder Closed Practice",
        profession: "Not listed",
        serviceArea: "Placeholder region",
        bio: "PLACEHOLDER rejected application. Not a real person.",
        status: "rejected",
        role: "professional",
        reviewNote: "Placeholder decision, so the admin history has a rejection to look at.",
        reviewedAt: now,
      },
    ];

    transaction(() => {
      for (const person of people) {
        insertProfile.run(
          person.id,
          person.email,
          person.fullName,
          person.businessName,
          person.profession,
          person.serviceArea,
          person.bio,
          person.status,
          person.role,
          person.reviewNote,
          now,
          person.reviewedAt,
        );
        const password = person.role === "admin" ? adminPassword : professionalPassword;
        insertCredential.run(person.id, password);
      }
      const insertEvent = db.prepare(
        `insert into events (
          id, professional_id, title, summary, body, starts_at, location_label, status,
          view_count, like_count, heart_count, review_note, created_at, reviewed_at
        ) values (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?)`,
      );
      const events: Array<{
        id: string;
        professionalId: string;
        title: string;
        summary: string;
        body: string;
        startsAt: string;
        locationLabel: string;
        status: Status;
        reviewNote: string | null;
        reviewedAt: string | null;
      }> = [
        {
          id: IDS.eventOne,
          professionalId: IDS.proOne,
          title: "Placeholder: community office hours",
          summary: "A sample listing so the event feed has a card. Not a real gathering.",
          body: "PLACEHOLDER event. No address, no host beyond the placeholder profile, and no attendance figure.",
          startsAt: zonedLocalToUtc("2026-11-18T17:30", "America/Chicago").toISOString(),
          locationLabel: "Placeholder venue — not a street address",
          status: "approved",
          reviewNote: "Approved for the preview feed only.",
          reviewedAt: now,
        },
        {
          id: IDS.eventTwo,
          professionalId: IDS.proTwo,
          title: "Placeholder: contractor networking hour",
          summary: "Another sample card for the slider. Not a real meetup.",
          body: "PLACEHOLDER event for layout review.",
          startsAt: zonedLocalToUtc("2026-12-02T18:00", "America/Chicago").toISOString(),
          locationLabel: "Placeholder venue — not a street address",
          status: "approved",
          reviewNote: "Approved for the preview feed only.",
          reviewedAt: now,
        },
        {
          id: IDS.eventThree,
          professionalId: IDS.proOne,
          title: "Placeholder: receipt-filing questions",
          summary: "A sample card about year-end records. Not a class, and not tax advice.",
          body: "PLACEHOLDER event. It does not file taxes and it is not a client story.",
          startsAt: zonedLocalToUtc("2026-12-09T12:00", "America/Chicago").toISOString(),
          locationLabel: "Placeholder venue — not a street address",
          status: "approved",
          reviewNote: "Approved for the preview feed only.",
          reviewedAt: now,
        },
        {
          id: IDS.eventPending,
          professionalId: IDS.proTwo,
          title: "Placeholder: waiting on admin",
          summary: "This one stays hidden until an admin approves it.",
          body: "PLACEHOLDER pending event.",
          startsAt: zonedLocalToUtc("2026-12-16T18:00", "America/Chicago").toISOString(),
          locationLabel: "Placeholder venue — not a street address",
          status: "pending",
          reviewNote: null,
          reviewedAt: null,
        },
      ];
      for (const event of events) {
        insertEvent.run(
          event.id,
          event.professionalId,
          event.title,
          event.summary,
          event.body,
          event.startsAt,
          event.locationLabel,
          event.status,
          event.reviewNote,
          now,
          event.reviewedAt,
        );
      }
    });
  };

  seed();

  return {
    signUp(input) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      try {
        transaction(() => {
          db.prepare(
            `insert into profiles (
              id, email, full_name, business_name, profession, service_area, bio, website, public_contact,
              status, role, created_at, gallery_json, featured_consultation
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'professional', ?, '[]', 0)`,
          ).run(
            id,
            input.email,
            input.fullName,
            input.businessName,
            input.profession,
            input.serviceArea,
            input.bio,
            input.website || null,
            input.publicContact || null,
            now,
          );
          db.prepare("insert into credentials (user_id, password_hash) values (?, ?)").run(id, hashPassword(input.password));
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("UNIQUE")) {
          return { ok: false, error: "An account with that email already exists. Sign in instead." };
        }
        return { ok: false, error: "The application could not be saved." };
      }
      return { ok: true, data: { userId: id } };
    },

    authenticate(email, password) {
      const row = db.prepare(
        `select p.*, c.password_hash
         from profiles p join credentials c on c.user_id = p.id
         where p.email = ?`,
      ).get(email.trim().toLowerCase());
      if (!row || !verifyPassword(password, text(row, "password_hash"))) {
        return { ok: false, error: "Email or password does not match." };
      }
      return { ok: true, data: sessionFromProfile(mapProfile(row)) };
    },

    getUser(id) {
      const profile = profileById(id);
      return profile ? sessionFromProfile(profile) : null;
    },

    getProfile: profileById,

    listApprovedProfessionals() {
      return db
        .prepare(
          `select * from profiles
           where status = 'approved' and role = 'professional'
           order by business_name collate nocase`,
        )
        .all()
        .map(mapProfile);
    },

    listProfessionalsForAdmin() {
      return db
        .prepare("select * from profiles where role = 'professional' order by created_at desc")
        .all()
        .map(mapProfile);
    },

    setProfessionalStatus(actorId, profileId, status, note) {
      const admin = requireAdmin(actorId);
      if (!admin.ok) return admin;
      const profile = profileById(profileId);
      if (!profile || profile.role !== "professional") return { ok: false, error: "That record was not found." };
      db.prepare(
        `update profiles set status = ?, review_note = ?, reviewed_at = ?,
          featured_consultation = case when ? <> 'approved' then 0 else featured_consultation end
         where id = ?`,
      ).run(status, note || null, new Date().toISOString(), status, profileId);
      return { ok: true, data: null };
    },

    updateConsultation(actorId, profileId, input) {
      const admin = requireAdmin(actorId);
      if (!admin.ok) return admin;
      const profile = profileById(profileId);
      if (!profile || profile.role !== "professional") return { ok: false, error: "That record was not found." };
      if (input.featured && profile.status !== "approved") {
        return { ok: false, error: "Approve the professional before featuring them." };
      }
      if (input.featured && !input.category) {
        return { ok: false, error: "Choose a category to feature this profile." };
      }
      db.prepare(
        `update profiles set
          consultation_category = ?, consultation_category_label = ?, consultation_headline = ?,
          specialty = ?, credentials = ?, contact_note = ?, gallery_json = ?, featured_consultation = ?
         where id = ?`,
      ).run(
        input.category || null,
        input.categoryLabel || null,
        input.headline || null,
        input.specialty || null,
        input.credentials || null,
        input.contactNote || null,
        JSON.stringify(input.gallery),
        input.featured ? 1 : 0,
        profileId,
      );
      return { ok: true, data: null };
    },

    listFeaturedConsultations() {
      return db
        .prepare(
          `select * from profiles
           where role = 'professional' and status = 'approved'
             and featured_consultation = 1 and consultation_category is not null
           order by business_name collate nocase`,
        )
        .all()
        .map(mapProfile)
        .map(profileToConsultation);
    },

    listApprovedEvents(viewerId) {
      return selectEvents(
        "where e.status = 'approved' and p.status = 'approved' order by e.starts_at asc",
        [],
        viewerId,
      );
    },

    listEventsForAdmin(viewerId) {
      return selectEvents("order by e.created_at desc", [], viewerId);
    },

    listMyEvents(userId) {
      return selectEvents("where e.professional_id = ? order by e.created_at desc", [userId], userId);
    },

    getPublicEvent(id, viewerId) {
      return (
        selectEvents(
          "where e.id = ? and e.status = 'approved' and p.status = 'approved'",
          [id],
          viewerId,
        )[0] ?? null
      );
    },

    createEvent(input) {
      const profile = profileById(input.professionalId);
      if (!profile || profile.role !== "professional" || profile.status !== "approved") {
        return { ok: false, error: "Approved professionals can add events. This account is not approved yet." };
      }
      const day = utcDay();
      const countRow = db
        .prepare("select count(*) as n from events where professional_id = ? and created_at like ?")
        .get(input.professionalId, `${day}%`);
      if (countRow && integer(countRow, "n") >= 10) {
        return { ok: false, error: "That is enough events for today. Try again tomorrow." };
      }
      const id = crypto.randomUUID();
      db.prepare(
        `insert into events (
          id, professional_id, title, summary, body, starts_at, location_label, status, created_at
        ) values (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      ).run(id, input.professionalId, input.title, input.summary, input.body, input.startsAt, input.locationLabel, new Date().toISOString());
      return { ok: true, data: { id } };
    },

    setEventStatus(actorId, eventId, status, note) {
      const admin = requireAdmin(actorId);
      if (!admin.ok) return admin;
      const row = db.prepare("select id from events where id = ?").get(eventId);
      if (!row) return { ok: false, error: "That record was not found." };
      db.prepare("update events set status = ?, review_note = ?, reviewed_at = ? where id = ?").run(
        status,
        note || null,
        new Date().toISOString(),
        eventId,
      );
      return { ok: true, data: null };
    },

    recordView(eventId, viewerKey, userId, viewedOn) {
      const event = db
        .prepare(
          `select e.id, e.professional_id, e.status, p.status as professional_status, e.view_count
           from events e join profiles p on p.id = e.professional_id
           where e.id = ?`,
        )
        .get(eventId);
      if (!event || text(event, "status") !== "approved" || text(event, "professional_status") !== "approved") {
        return { viewCount: event ? integer(event, "view_count") : 0, counted: false };
      }
      if (userId && userId === text(event, "professional_id")) {
        return { viewCount: integer(event, "view_count"), counted: false };
      }
      if (!/^[A-Za-z0-9_-]{16,128}$/.test(viewerKey)) {
        return { viewCount: integer(event, "view_count"), counted: false };
      }
      const day = viewedOn ?? utcDay();
      const inserted = db
        .prepare("insert into event_views (event_id, viewer_key, viewed_on) values (?, ?, ?) on conflict do nothing")
        .run(eventId, viewerKey, day);
      const counted = Number(inserted.changes) > 0;
      if (counted) refreshCounts(eventId);
      const updated = db.prepare("select view_count from events where id = ?").get(eventId);
      return { viewCount: updated ? integer(updated, "view_count") : 0, counted };
    },

    toggleReaction(eventId, userId, kind) {
      const user = profileById(userId);
      if (!user || user.status !== "approved") {
        return { ok: false, error: "Reactions are open to approved accounts." };
      }
      const event = db
        .prepare(
          `select e.id, e.professional_id, e.status, p.status as professional_status
           from events e join profiles p on p.id = e.professional_id where e.id = ?`,
        )
        .get(eventId);
      if (!event || text(event, "status") !== "approved" || text(event, "professional_status") !== "approved") {
        return { ok: false, error: "That event is not public." };
      }
      if (text(event, "professional_id") === userId) {
        return { ok: false, error: "You organize this event, so your reaction is not counted." };
      }
      transaction(() => {
        const existing = db
          .prepare("select 1 as n from event_reactions where event_id = ? and user_id = ? and reaction = ?")
          .get(eventId, userId, kind);
        if (existing) {
          db.prepare("delete from event_reactions where event_id = ? and user_id = ? and reaction = ?").run(eventId, userId, kind);
        } else {
          db.prepare("insert into event_reactions (event_id, user_id, reaction, created_at) values (?, ?, ?, ?)").run(
            eventId,
            userId,
            kind,
            new Date().toISOString(),
          );
        }
        refreshCounts(eventId);
      });
      const updated = selectEvents("where e.id = ?", [eventId], userId)[0];
      return {
        ok: true,
        data: {
          likeCount: updated?.likeCount ?? 0,
          heartCount: updated?.heartCount ?? 0,
          viewerHasLike: updated?.viewerHasLike ?? false,
          viewerHasHeart: updated?.viewerHasHeart ?? false,
        },
      };
    },
  };
}

const globalStore = globalThis as unknown as { __naathSqlite?: Store };

export function getSqliteStore(): Store {
  if (!globalStore.__naathSqlite) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    globalStore.__naathSqlite = openSqliteStore(path.join(dir, "demo.sqlite"));
  }
  return globalStore.__naathSqlite;
}
