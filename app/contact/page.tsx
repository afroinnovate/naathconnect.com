import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="section">
      <p className="kicker">Contact</p>
      <h1>Talk with Naath Connect</h1>
      <ul className="meta-list">
        <li>
          <span>Phone</span>
          Placeholder — not published
        </li>
        <li>
          <span>Email</span>
          Placeholder — not published
        </li>
        <li>
          <span>Street address</span>
          Placeholder — not published. Naath Connect LLC is an Iowa LLC.
        </li>
      </ul>
      <p>Professionals who want to be listed can use the application form. A public inbox is not on this preview.</p>
    </section>
  );
}
