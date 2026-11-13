import Link from "next/link";
import { EventSlider } from "@/components/EventSlider";
import { ProTile } from "@/components/ProTile";
import { toEventCard } from "@/lib/event-card";
import { featuredPros, homepageProfessionals, mergeDirectory, proFromAccount } from "@/lib/featured-pros";
import { HOME_OVERVIEW, HOME_PURPOSE, HOME_QUOTE, HOME_QUOTE_ATTRIBUTION, HOME_QUOTE_GLOSS } from "@/lib/home";
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
  const approved = (await store.listApprovedProfessionals()).map(proFromAccount);
  const people = homepageProfessionals(mergeDirectory(featuredPros, approved));
  const listed = params.events === "empty" ? [] : await store.listApprovedEvents(session?.id ?? null);
  const cards = listed.map((event) => toEventCard(event, session));

  return (
    <>
      <section className="hero hero-min">
        <h1>{HOME_OVERVIEW}</h1>
        <figure className="pull-quote">
          <blockquote>
            <p>
              &quot;{HOME_QUOTE}&quot; {HOME_QUOTE_GLOSS}
            </p>
          </blockquote>
          <figcaption>{HOME_QUOTE_ATTRIBUTION}</figcaption>
        </figure>
        <p className="purpose">{HOME_PURPOSE}</p>
      </section>

      <section className="section" id="professionals">
        <h2 className="sr-only">Professionals</h2>
        <div className="tiles">
          {people.map((pro) => (
            <ProTile key={pro.slug} pro={pro} />
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
