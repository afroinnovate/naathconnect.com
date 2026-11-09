import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Consulting" };

export default function ConsultationsPage() {
  return (
    <section className="section">
      <h1>Consulting</h1>
      <div className="contact-row" style={{ marginTop: "1.2rem" }}>
        <Link className="contact-btn" href="/pros/tango-tew">
          Tech
        </Link>
        <Link className="contact-btn" href="/pros/gatbel-chamjock">
          Medical
        </Link>
        <Link className="contact-btn" href="/directory">
          Directory
        </Link>
      </div>
    </section>
  );
}
