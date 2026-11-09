import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProView } from "@/components/ProView";
import { getFeaturedPro, type PublicPro } from "@/lib/featured-pros";
import { getStore } from "@/lib/store";
import type { Profile } from "@/lib/types";

function fromDirectory(person: Profile): PublicPro {
  const placeholder = person.bio.includes("PLACEHOLDER");
  return {
    slug: person.id,
    name: person.fullName,
    category: "tech",
    categoryLabel: person.profession || "Professional",
    line: person.businessName,
    location: person.serviceArea,
    image: {
      src: "/images/placeholders/finance.svg",
      alt: placeholder ? "Placeholder graphic." : person.fullName,
      width: 800,
      height: 1000,
    },
    placeholder,
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const featured = getFeaturedPro(slug);
  return { title: featured?.name ?? "Professional" };
}

export default async function ProfessionalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const featured = getFeaturedPro(slug);
  if (featured) return <ProView pro={featured} />;
  const store = await getStore();
  const person = (await store.listApprovedProfessionals()).find((item) => item.id === slug);
  if (!person) notFound();
  return <ProView pro={fromDirectory(person)} />;
}
