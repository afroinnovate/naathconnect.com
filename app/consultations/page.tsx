import type { Metadata } from "next";
import Link from "next/link";
import { groupConsultations } from "@/lib/consultations";
import { listConsultations } from "@/lib/store";

export const metadata: Metadata = { title: "Consulting" };

export default async function ConsultationsPage() {
  const groups = groupConsultations(await listConsultations());
  return (
    <section className="section">
      <p className="kicker">Consulting</p>
      <h1>Professional consultation</h1>
      <p className="lede">
        Technology consulting is Naath Connect’s own practice. Other sections, starting with medical consultation, are
        profiles. A directory professional can be added to a section after an admin approves and features them.
      </p>
      <div className="directory-grid">
        {groups.map((group) => (
          <article className="person-card" key={group.category}>
            <h2>{group.label}</h2>
            <p>{group.profiles.map((profile) => profile.name).join(", ")}</p>
            <p>
              <Link href={`/consultations/${group.category}`}>Open {group.label.toLowerCase()}</Link>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
