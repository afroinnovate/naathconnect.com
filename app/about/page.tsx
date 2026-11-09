import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="section">
      <h1>Naath Connect</h1>
      <p className="hero-line">An Iowa LLC owned by Tango Tew.</p>
    </section>
  );
}
