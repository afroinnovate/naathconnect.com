import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions";
import { EventForm } from "@/components/EventForm";
import { formatEventTime } from "@/lib/time";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Account" };

const notices: Record<string, string> = {
  submitted: "Application received. It stays pending until an admin approves it. You can sign in to check the status.",
  event: "Event submitted. It stays off the public feed until an admin approves it.",
};

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");
  const { notice } = await searchParams;
  const store = await getStore();
  const events = await store.listMyEvents(session.id);

  return (
    <section className="section">
      <p className="kicker">Account</p>
      <h1>{session.fullName}</h1>
      <p>
        <span className={`status ${session.status}`}>{session.status}</span> {session.businessName}
      </p>
      {notice && notices[notice] ? <p className="notice">{notices[notice]}</p> : null}
      {session.status === "pending" ? (
        <p>Your application is pending. You will not appear in the directory, and you cannot post events, until an admin approves it.</p>
      ) : null}
      {session.status === "rejected" ? (
        <p>This application was not approved. It is not in the public directory. Ask the admin if it should be reviewed again.</p>
      ) : null}
      {session.role === "admin" ? (
        <p>
          You are the admin. Reviews happen on the admin page.
        </p>
      ) : null}
      {session.status === "approved" && session.role === "professional" ? (
        <>
          <h2>Add a community event</h2>
          <p>It stays pending until an admin approves it.</p>
          <EventForm />
        </>
      ) : null}
      <h2>Your events</h2>
      {events.length === 0 ? <p>No events yet.</p> : null}
      <div className="queue">
        {events.map((event) => (
          <article className="queue-card" key={event.id}>
            <p>
              <span className={`status ${event.status}`}>{event.status}</span>
            </p>
            <h3>{event.title}</h3>
            <p>{formatEventTime(event.startsAt)}</p>
            {event.reviewNote ? <p className="quiet">{event.reviewNote}</p> : null}
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
