import type { Metadata } from "next";
import { SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL, SITE_WHATSAPP } from "@/lib/site";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="section">
      <h1>Contact</h1>
      <div className="contact-row" style={{ marginTop: "1.2rem" }}>
        <a className="contact-btn" href={`mailto:${SITE_EMAIL}`}>
          {SITE_EMAIL}
        </a>
        <a className="contact-btn" href={SITE_WHATSAPP}>
          WhatsApp
        </a>
        <a className="contact-btn" href={`tel:${SITE_PHONE_TEL}`}>
          {SITE_PHONE_DISPLAY}
        </a>
      </div>
    </section>
  );
}
