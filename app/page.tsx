import Link from "next/link";
import { EventSlider } from "@/components/EventSlider";
import { HeroSearch } from "@/components/HeroSearch";
import { ServiceSlideshow } from "@/components/ServiceSlideshow";
import { toEventCard } from "@/lib/event-card";
import { serviceOffers, servicePath, serviceSlideIcons } from "@/lib/services";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";

function postEventHref(session: SessionUser | null): string {
  if (!session) return "/login?next=/account";
  return "/account";
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ events?: string }> }) {
  const params = await searchParams;
  const session = await getSession();
  const store = await getStore();
  const listed = params.events === "empty" ? [] : await store.listApprovedEvents(session?.id ?? null);
  const cards = listed.map((event) => toEventCard(event, session));

  return (
    <>
      <section className="hero hero-min">
        <h1>Find a local professional.</h1>
        <HeroSearch />
      </section>

      <section className="section" id="services">
        <h2 className="sr-only">Services</h2>
        <div className="service-board">
          {serviceOffers.map((service, index) => (
            <ServiceSlideshow
              key={service.id}
              name={service.name}
              tagline={service.title}
              slides={serviceSlideIcons[service.id] ?? []}
              order={index}
              href={servicePath(service.id)}
            />
          ))}
        </div>
      </section>

      <section className="section" id="events">
        <div className="section-head">
          <h2>Events</h2>
          {cards.length > 0 ? <Link href="/events">All</Link> : null}
        </div>
        {cards.length === 0 ? (
          <div className="empty">
            <p>No professional event is posted yet</p>
            <Link className="post-btn" href={postEventHref(session)}>
              Post a professional event
            </Link>
          </div>
        ) : (
          <EventSlider events={cards} />
        )}
      </section>
    </>
  );
}
