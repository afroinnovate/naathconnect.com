import type { Metadata } from "next";
import { monogram } from "@/lib/event-card";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Community directory" };

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const store = await getStore();
  const people = (await store.listApprovedProfessionals()).filter((person) => {
    if (!query) return true;
    return [person.fullName, person.businessName, person.profession, person.serviceArea, person.bio]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <section className="section">
      <p className="kicker">Community directory</p>
      <h1>Approved professionals</h1>
      <p className="lede">
        These listings were approved by an admin. Placeholder names are sample records for this preview, not clients.
      </p>
      <form className="stack" action="/directory" method="get">
        <label>
          Search by name, profession, or area
          <input name="q" defaultValue={q} />
        </label>
        <button type="submit">Search</button>
      </form>
      {people.length === 0 ? <p>No approved professionals match that search.</p> : null}
      <div className="directory-grid">
        {people.map((person) => (
          <article className="person-card" key={person.id}>
            <div className="person-top">
              <span className="monogram" aria-hidden="true">
                {monogram(person.businessName)}
              </span>
              <div>
                <h2>{person.businessName}</h2>
                <p className="quiet">{person.fullName}</p>
              </div>
            </div>
            <p>{person.profession}</p>
            <p className="quiet">{person.serviceArea}</p>
            <p>{person.bio}</p>
            {person.website ? (
              <p>
                <a href={person.website} rel="noreferrer">
                  {person.website}
                </a>
              </p>
            ) : null}
            {person.publicContact ? <p>{person.publicContact}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
