import Link from "next/link";
import { EventSlider } from "@/components/EventSlider";
import { HeroSearch } from "@/components/HeroSearch";
import { OptimizedPhoto } from "@/components/OptimizedPhoto";
import { toEventCard } from "@/lib/event-card";
import { getFeaturedPro } from "@/lib/featured-pros";
import { serviceOffers } from "@/lib/services";
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
  const photos = getFeaturedPro("tango-tew")?.photos ?? [];

  return (
    <>
      <section className="hero hero-min">
        <h1>Find a local professional.</h1>
        <HeroSearch />
      </section>

      {photos.length > 0 ? (
        <section className="section" aria-label="Photo gallery">
          <div className="photo-gallery">
            {photos.map((photo) => (
              <figure key={photo.src}>
                <OptimizedPhoto src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section" id="services">
        <h2 className="sr-only">Services</h2>
        <div className="visuals">
          {serviceOffers.map((service, index) => {
            const photo = photos[index % Math.max(photos.length, 1)];
            return (
              <Link key={service.id} href="/pros/tango-tew" className="visual">
                {photo ? <OptimizedPhoto src={photo.src} alt="" width={photo.width} height={photo.height} /> : null}
                <span>{service.name}</span>
              </Link>
            );
          })}
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
