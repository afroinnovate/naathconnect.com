import Link from "next/link";
import { EventSlider } from "@/components/EventSlider";
import { HeroMedia } from "@/components/HeroMedia";
import { HeroSearch } from "@/components/HeroSearch";
import { ProTile } from "@/components/ProTile";
import { toEventCard } from "@/lib/event-card";
import { homeTiles } from "@/lib/featured-pros";
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
      <section className="hero">
        <div>
          <h1>Find a local professional.</h1>
          <p className="hero-line">
            Naath Connect connects Naath communities and businesses worldwide with local professionals.
          </p>
          <HeroSearch />
        </div>
        <HeroMedia />
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

      <section className="section" id="services">
        <div className="section-head">
          <h2>Services</h2>
        </div>
        <div className="tiles">
          {homeTiles.map((pro) => (
            <ProTile key={pro.slug} pro={pro} />
          ))}
          <Link href="/onboarding" className="tile join-tile">
            <span className="chip">Directory</span>
            <strong>More professionals</strong>
            <span className="tile-line">Join as a professional.</span>
            <span className="tile-where">Apply</span>
          </Link>
        </div>
      </section>
    </>
  );
}
