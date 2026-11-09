import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <p className="kicker">About</p>
      <h1>Naath Connect LLC</h1>
      <p className="lede">
        Naath Connect LLC is an Iowa limited liability company owned by Tango Tew. It is a general services company that
        connects the community with local, community-based professional services and businesses. Its own practice leads
        with technology consulting.
      </p>
      <p>
        Professionals apply to a public directory. Events they post stay hidden until an admin approves them. This
        preview does not publish a phone number, an email address, or a street address.
      </p>
    </section>
  );
}
