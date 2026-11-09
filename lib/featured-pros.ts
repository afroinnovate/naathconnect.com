import { serviceOffers } from "./services";
import { RESUME_URL, SITE_EMAIL, SITE_PHONE_DISPLAY, SITE_PHONE_TEL, SITE_WHATSAPP, TANGO_GITHUB, TANGO_LINKEDIN } from "./site";

export type ProCategory = "tech" | "medical" | "software" | "tax" | "auto" | "finance" | "education";

export type ServiceTile = {
  name: string;
  line: string;
};

export type PublicPro = {
  slug: string;
  name: string;
  category: ProCategory;
  categoryLabel: string;
  line: string;
  location: string | null;
  image: { src: string; alt: string; width: number; height: number };
  placeholder: boolean;
  comingSoon: boolean;
  profession: string | null;
  school: string | null;
  industry: string | null;
  years: string | null;
  services: ServiceTile[];
  serviceAreas: string | null;
  email: string | null;
  phoneDisplay: string | null;
  phoneTel: string | null;
  whatsapp: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
};

const tangoServices: ServiceTile[] = serviceOffers.map((service) => ({
  name: service.name,
  line: service.title,
}));

export const featuredPros: PublicPro[] = [
  {
    slug: "tango-tew",
    name: "Tango Tew",
    category: "tech",
    categoryLabel: "Tech",
    line: "Technology consulting.",
    location: null,
    image: {
      src: "/images/tango/tango-tech-consultation.jpg",
      alt: "Tango Tew at his desk.",
      width: 1122,
      height: 1402,
    },
    placeholder: false,
    comingSoon: false,
    profession: "Technology consultant",
    school:
      "MS in Computer Science, AI specialization, SMU (Southern Methodist University), Dallas, TX. BS in Computer Science, Dire Dawa University, Ethiopia.",
    industry: "Technology",
    years: "7 years of tech consulting",
    services: tangoServices,
    serviceAreas: null,
    email: SITE_EMAIL,
    phoneDisplay: SITE_PHONE_DISPLAY,
    phoneTel: SITE_PHONE_TEL,
    whatsapp: SITE_WHATSAPP,
    website: RESUME_URL || null,
    github: TANGO_GITHUB,
    linkedin: TANGO_LINKEDIN,
  },
  {
    slug: "gatbel-chamjock",
    name: "Dr. Gatbel ChamJock",
    category: "medical",
    categoryLabel: "Medical",
    line: "Coming soon.",
    location: "Placeholder — location not published",
    image: {
      src: "/images/gatbel/gown.svg",
      alt: "Placeholder graphic. Not a photo of Dr. Gatbel ChamJock.",
      width: 800,
      height: 1000,
    },
    placeholder: true,
    comingSoon: true,
    profession: null,
    school: null,
    industry: null,
    years: null,
    services: [],
    serviceAreas: null,
    email: null,
    phoneDisplay: null,
    phoneTel: null,
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
  },
  {
    slug: "taxation",
    name: "Taxation",
    category: "tax",
    categoryLabel: "Tax",
    line: "Coming soon.",
    location: "Placeholder location",
    image: {
      src: "/images/placeholders/tax.svg",
      alt: "Placeholder graphic for a tax professional.",
      width: 800,
      height: 1000,
    },
    placeholder: true,
    comingSoon: true,
    profession: null,
    school: null,
    industry: null,
    years: null,
    services: [],
    serviceAreas: null,
    email: null,
    phoneDisplay: null,
    phoneTel: null,
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
  },
  {
    slug: "finance",
    name: "Finance",
    category: "finance",
    categoryLabel: "Finance",
    line: "Coming soon.",
    location: "Placeholder location",
    image: {
      src: "/images/placeholders/finance.svg",
      alt: "Placeholder graphic for a finance professional.",
      width: 800,
      height: 1000,
    },
    placeholder: true,
    comingSoon: true,
    profession: null,
    school: null,
    industry: null,
    years: null,
    services: [],
    serviceAreas: null,
    email: null,
    phoneDisplay: null,
    phoneTel: null,
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
  },
  {
    slug: "auto",
    name: "Auto",
    category: "auto",
    categoryLabel: "Auto",
    line: "Coming soon.",
    location: "Placeholder location",
    image: {
      src: "/images/placeholders/auto.svg",
      alt: "Placeholder graphic for an auto professional.",
      width: 800,
      height: 1000,
    },
    placeholder: true,
    comingSoon: true,
    profession: null,
    school: null,
    industry: null,
    years: null,
    services: [],
    serviceAreas: null,
    email: null,
    phoneDisplay: null,
    phoneTel: null,
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
  },
];

export const homeTiles = featuredPros;

export function getFeaturedPro(slug: string): PublicPro | undefined {
  return featuredPros.find((pro) => pro.slug === slug);
}

export function filterPros(
  pros: PublicPro[],
  query: { q?: string; category?: string; location?: string },
): PublicPro[] {
  const keyword = (query.q ?? "").trim().toLowerCase();
  const category = (query.category ?? "").trim().toLowerCase();
  const location = (query.location ?? "").trim().toLowerCase();
  return pros.filter((pro) => {
    if (category && pro.category !== category) return false;
    if (location) {
      const where = `${pro.location ?? ""} ${pro.serviceAreas ?? ""}`.toLowerCase();
      if (!where.includes(location)) return false;
    }
    if (!keyword) return true;
    const haystack = [
      pro.name,
      pro.line,
      pro.profession,
      pro.industry,
      pro.category,
      pro.categoryLabel,
      pro.school,
      ...pro.services.map((service) => `${service.name} ${service.line}`),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(keyword);
  });
}
