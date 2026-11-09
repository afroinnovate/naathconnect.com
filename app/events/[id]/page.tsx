import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/EventCard";
import { toEventCard } from "@/lib/event-card";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Event" };

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const store = await getStore();
  const event = await store.getPublicEvent(id, session?.id ?? null);
  if (!event) notFound();
  return (
    <section className="section">
      <p>
        <Link href="/events">All events</Link>
      </p>
      <EventCard event={toEventCard(event, session, true)} />
    </section>
  );
}
