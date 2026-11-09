import type { Metadata } from "next";
import { HeroSearch } from "@/components/HeroSearch";
import { ProTile } from "@/components/ProTile";
import { featuredPros, filterPros, type PublicPro } from "@/lib/featured-pros";
import { getStore } from "@/lib/store";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Directory" };

function fromProfile(person: Profile): PublicPro {
  return {
    slug: person.id,
    name: person.fullName,
    category: "tech",
    categoryLabel: person.profession || "Professional",
    line: person.bio.includes("PLACEHOLDER") ? "Placeholder." : person.businessName,
    location: person.serviceArea,
    image: {
      src: "/images/placeholders/finance.svg",
      alt: "",
      width: 800,
      height: 1000,
    },
    placeholder: person.bio.includes("PLACEHOLDER"),
    comingSoon: false,
    profession: person.profession,
    school: null,
    industry: null,
    years: null,
    services: [],
    serviceAreas: person.serviceArea,
    email: null,
    phoneDisplay: null,
    phoneTel: null,
    whatsapp: null,
    website: person.website,
    github: null,
    linkedin: null,
  };
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; location?: string }>;
}) {
  const params = await searchParams;
  const store = await getStore();
  const approved = (await store.listApprovedProfessionals()).map(fromProfile);
  const people = filterPros([...featuredPros, ...approved], params);

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
    </section>
  );
}
