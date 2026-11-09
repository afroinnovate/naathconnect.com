import type { Metadata } from "next";
import { EventCard } from "@/components/EventCard";
import { toEventCard } from "@/lib/event-card";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Events" };

export default async function EventsPage() {
  const session = await getSession();
  const store = await getStore();
  const events = await store.listApprovedEvents(session?.id ?? null);
  return (
    <section className="section">
      <p className="kicker">Community events</p>
      <h1>Approved events</h1>
      <p className="lede">
        Professionals submit events after their own listing is approved. An admin approves the event before it appears
        here. A view is counted once a day for each browser, and a reaction once per approved account.
      </p>
      <div className="feed">
        {events.length === 0 ? <p>No approved events yet.</p> : null}
        {events.map((event) => (
          <EventCard key={event.id} event={toEventCard(event, session, true)} />
        ))}
      </div>
    </section>
  );
}
