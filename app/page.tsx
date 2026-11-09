import Link from "next/link";
import { EventSlider } from "@/components/EventSlider";
import { HeroSearch } from "@/components/HeroSearch";
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

const frames = ["photo-face", "photo-desk", "photo-room"];

export default async function HomePage({ searchParams }: { searchParams: Promise<{ events?: string }> }) {
  const params = await searchParams;
  const session = await getSession();
  const store = await getStore();
  const listed = params.events === "empty" ? [] : await store.listApprovedEvents(session?.id ?? null);
  const cards = listed.map((event) => toEventCard(event, session));
  const tango = getFeaturedPro("tango-tew");
  const photo = tango?.image;

  return (
    <>
      <section className="hero hero-min">
        <h1>Find a local professional.</h1>
        <HeroSearch />
      </section>

      {photo ? (
        <section className="section" aria-label="Photo gallery">
          <div className="photo-gallery">
            {frames.map((frame) => (
              <figure key={frame} className={frame}>
                <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} />
              </figure>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section" id="services">
        <h2 className="sr-only">Services</h2>
        <div className="visuals">
          {serviceOffers.map((service, index) => (
            <Link key={service.id} href="/pros/tango-tew" className={`visual ${frames[index % frames.length]}`}>
              {photo ? <img src={photo.src} alt="" width={photo.width} height={photo.height} /> : null}
              <span>{service.name}</span>
            </Link>
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
