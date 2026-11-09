import Link from "next/link";
import { ConsultationSection } from "@/components/ConsultationSection";
import { EventSlider } from "@/components/EventSlider";
import { toEventCard } from "@/lib/event-card";
import { groupConsultations } from "@/lib/consultations";
import { getSession } from "@/lib/session";
import { getStore, listConsultations } from "@/lib/store";

export default async function HomePage() {
  const session = await getSession();
  const store = await getStore();
  const [events, consultations] = await Promise.all([
    store.listApprovedEvents(session?.id ?? null),
    listConsultations(),
  ]);
  const groups = groupConsultations(consultations);
  const cards = events.map((event) => toEventCard(event, session));

  return (
    <>
      <section className="hero">
        <p className="kicker">Naath Connect LLC · an Iowa LLC</p>
        <h1>Local professional services, and technology help in plain language.</h1>
        <p className="lede">
          Naath Connect connects this community with local, community-based professionals and businesses. Our own work
          leads with technology consulting for small business owners, community leaders, contractors, and truckers.
        </p>
        <div className="actions">
          <a className="button" href="#technology">
            See how we can help
          </a>
          <Link className="button-secondary" href="/directory">
            Community directory
          </Link>
          <Link className="button-secondary" href="/onboarding">
            Apply as a professional
          </Link>
        </div>
      </section>

      {groups.map((group) => (
        <ConsultationSection
          key={group.category}
          category={group.category}
          label={group.label}
          profiles={group.profiles}
          showServices={group.category === "technology"}
        />
      ))}

      <section className="section" id="directory-how">
        <h2>The community directory</h2>
        <p className="lede">
          Community professionals apply. Tango reviews each application. Only approved people appear in the public
          directory, and only approved events appear in the feed.
        </p>
        <ol className="steps">
          <li>
            <strong>Apply.</strong> Tell us who you are and the service you offer.
          </li>
          <li>
            <strong>Review.</strong> The listing stays pending until an admin approves it.
          </li>
          <li>
            <strong>Show up.</strong> Approved professionals can post events, which also wait for approval.
          </li>
        </ol>
      </section>

      <section className="section" id="events">
        <div className="slider-head">
          <div>
            <p className="kicker">Community events</p>
            <h2>Approved events</h2>
          </div>
          <Link href="/events">Full feed</Link>
        </div>
        <p>A listing shows here only after an admin approves it. Views and reactions are counted on this preview, not as live traffic.</p>
        {cards.length > 0 ? <EventSlider events={cards} /> : <p>No approved events yet.</p>}
      </section>
    </>
  );
}
