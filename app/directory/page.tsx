import type { Metadata } from "next";
import { HeroSearch } from "@/components/HeroSearch";
import { ProTile } from "@/components/ProTile";
import { featuredPros, filterPros, mergeDirectory, proFromAccount } from "@/lib/featured-pros";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Directory" };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
  const params = await searchParams;
  const store = await getStore();
  const approved = (await store.listApprovedProfessionals()).map(proFromAccount);
  const merged = mergeDirectory(featuredPros, approved);
  const people = filterPros(merged, params);
  const searching = Boolean(params.q?.trim() || params.category?.trim() || params.location?.trim());
  const comingSoon = searching ? [] : merged.filter((pro) => pro.placeholder || pro.comingSoon);

  return (
    <section className="section">
      <h1>Directory</h1>
      <HeroSearch q={params.q} category={params.category} location={params.location} />
      {people.length === 0 ? <p className="hero-line">No professionals match.</p> : null}
      <div className="tiles">
        {people.map((pro) => (
          <ProTile key={pro.slug} pro={pro} />
        ))}
      </div>
      {comingSoon.length > 0 ? (
        <div className="coming-soon">
          <h2>Coming soon</h2>
          <div className="tiles">
            {comingSoon.map((pro) => (
              <ProTile key={pro.slug} pro={pro} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
