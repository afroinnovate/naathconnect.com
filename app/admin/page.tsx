import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  approveEventAction,
  approveProfessionalAction,
  featureProfessionalAction,
  pendEventAction,
  pendProfessionalAction,
  rejectEventAction,
  rejectProfessionalAction,
  signOutAction,
} from "@/app/actions";
import { galleryToLines } from "@/lib/gallery";
import { formatEventTime } from "@/lib/time";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { Status } from "@/lib/types";

export const metadata: Metadata = { title: "Admin" };

const errors: Record<string, string> = {
  invalid: "That could not be saved.",
  category: "To feature someone, approve them first and add a category such as technology or medical.",
  gallery: "Each photo line must be a path under /images/, then alt text, then a caption, separated by |.",
};

function rank(status: Status): number {
  if (status === "pending") return 0;
  if (status === "approved") return 1;
  return 2;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  if (session.role !== "admin") redirect("/account");
  const { notice, error } = await searchParams;
  const store = await getStore();
  const [professionals, events] = await Promise.all([
    store.listProfessionalsForAdmin(),
    store.listEventsForAdmin(session.id),
  ]);
  const people = [...professionals].sort((a, b) => rank(a.status) - rank(b.status));
  const listings = [...events].sort((a, b) => rank(a.status) - rank(b.status));

  return (
    <section className="section">
      <p className="kicker">Admin</p>
      <h1>Review professionals and events</h1>
      <p>
        Signed in as {session.fullName}. Approving a professional puts them in the public directory. Approving an event
        puts it on the home feed. Featuring an approved professional adds them to a consultation section — technology,
        medical, or a new category you name.
      </p>
      {notice === "saved" ? <p className="notice">Saved.</p> : null}
      {error && errors[error] ? (
        <p className="alert" role="alert">
          {errors[error]}
        </p>
      ) : null}

      <h2>Professionals</h2>
      <div className="queue">
        {people.map((person) => (
          <article className="queue-card" key={person.id}>
            <p>
              <span className={`status ${person.status}`}>{person.status}</span> {person.fullName}
            </p>
            <h3>{person.businessName}</h3>
            <p>
              {person.profession} · {person.serviceArea}
            </p>
            <p>{person.bio}</p>
            <p className="quiet">{person.email}</p>
            {person.reviewNote ? <p className="quiet">Last note: {person.reviewNote}</p> : null}
            <form className="stack">
              <input type="hidden" name="id" value={person.id} />
              <label>
                Note
                <textarea name="note" defaultValue={person.reviewNote ?? ""} />
              </label>
              <div className="row-actions">
                <button type="submit" formAction={approveProfessionalAction}>
                  Approve
                </button>
                <button type="submit" formAction={rejectProfessionalAction} className="button-secondary">
                  Reject
                </button>
                <button type="submit" formAction={pendProfessionalAction} className="button-secondary">
                  Mark pending
                </button>
              </div>
            </form>
            <details>
              <summary>Consultation listing</summary>
              <form action={featureProfessionalAction} className="stack">
                <input type="hidden" name="id" value={person.id} />
                <label>
                  Category slug
                  <input name="category" defaultValue={person.consultationCategory ?? ""} placeholder="medical" />
                </label>
                <label>
                  Category label
                  <input name="categoryLabel" defaultValue={person.consultationCategoryLabel ?? ""} placeholder="Medical consultation" />
                </label>
                <label>
                  Headline
                  <input name="headline" defaultValue={person.consultationHeadline ?? ""} />
                </label>
                <label>
                  Specialty
                  <input name="specialty" defaultValue={person.specialty ?? ""} />
                </label>
                <label>
                  Credentials
                  <input name="credentials" defaultValue={person.credentials ?? ""} />
                </label>
                <label>
                  Contact note
                  <input name="contactNote" defaultValue={person.contactNote ?? ""} />
                </label>
                <label>
                  Photos, one per line: /images/name/file.jpg | alt | caption
                  <textarea name="gallery" defaultValue={galleryToLines(person.gallery)} />
                </label>
                <label className="check">
                  <input type="checkbox" name="featured" value="yes" defaultChecked={person.featuredConsultation} />
                  <span>Feature on the public consultation section after approval</span>
                </label>
                <button type="submit">Save consultation listing</button>
              </form>
            </details>
          </article>
        ))}
      </div>

      <h2>Events</h2>
      <div className="queue">
        {listings.map((event) => (
          <article className="queue-card" key={event.id}>
            <p>
              <span className={`status ${event.status}`}>{event.status}</span> {event.businessName}
              {event.professionalStatus !== "approved" ? " · professional is not approved, so the event stays hidden" : ""}
            </p>
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
            <p className="quiet">
              {formatEventTime(event.startsAt)} · {event.locationLabel}
            </p>
            {event.reviewNote ? <p className="quiet">Last note: {event.reviewNote}</p> : null}
            <form className="stack">
              <input type="hidden" name="id" value={event.id} />
              <label>
                Note
                <textarea name="note" defaultValue={event.reviewNote ?? ""} />
              </label>
              <div className="row-actions">
                <button type="submit" formAction={approveEventAction}>
                  Approve
                </button>
                <button type="submit" formAction={rejectEventAction} className="button-secondary">
                  Reject
                </button>
                <button type="submit" formAction={pendEventAction} className="button-secondary">
                  Mark pending
                </button>
              </div>
            </form>
          </article>
        ))}
      </div>
      <form action={signOutAction}>
        <button type="submit" className="button-secondary">
          Sign out
        </button>
      </form>
    </section>
  );
}
