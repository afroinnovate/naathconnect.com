import { getService, serviceOffers } from "./services";
import { SERVICE_TYPES, type ServiceType } from "./service-types";
import { RESUME_URL, SITE_EMAIL, SITE_WHATSAPP, TANGO_GITHUB, TANGO_LINKEDIN } from "./site";

export type ServiceTile = {
  name: string;
  line: string;
  slides?: readonly string[];
  /** Compact shop-service icon. These do not open a service page. */
  icon?: string;
};

export type ProfilePoint = {
  title: string;
  detail: string;
};

export type PublicPro = {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  line: string;
  /** Set only when the professional has a business name. */
  businessName: string | null;
  /** Empty means no type is known. A professional can have more than one. */
  serviceTypes: ServiceType[];
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
  /** Account email used only to avoid a second card. Not rendered. */
  dedupeEmail?: string | null;
  whatsapp: string | null;
  website: string | null;
  websiteLabel?: string | null;
  github: string | null;
  linkedin: string | null;
  /** Matches every location query. Not a personal city. */
  remote: boolean;
  /** Extra words that should find this professional. */
  searchTerms: string;
  /** Short services line for the directory card. */
  serviceSummary?: string | null;
  photos: { src: string; alt: string; width: number; height: number }[];
  bio?: string | null;
  notice?: string | null;
  /** Shown only when Tango has approved a number for this listing. */
  phone?: { label: string; href: string } | null;
  /** Short credentials shown as badges, such as DrPH. */
  credentialBadges?: readonly string[];
  /** Professional experience, already ordered by impact. */
  experience?: readonly ProfilePoint[];
  /** Titles and credentials, already ordered by impact. */
  titles?: readonly ProfilePoint[];
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
    businessName: null,
    serviceTypes: ["Business", "Free/Volunteer"],
    location: null,
    image: {
      src: "/images/tango/tango-headshot-circle.webp",
      alt: "Tango Tew.",
      width: 811,
      height: 811,
    },
    photos: [
      {
        src: "/images/tango/tango-office-desk.webp",
        alt: "Tango Tew at his desk.",
        width: 1200,
        height: 1600,
      },
      {
        src: "/images/tango/tango-headshot.webp",
        alt: "Tango Tew.",
        width: 551,
        height: 551,
      },
      {
        src: "/images/tango/tango-smu-ring.webp",
        alt: "Tango Tew at Southern Methodist University.",
        width: 1200,
        height: 1600,
      },
    ],
    placeholder: false,
    comingSoon: false,
    profession: "Technology consultant",
    school:
      "MS in Computer Science, AI specialization, SMU (Southern Methodist University), Dallas, TX. BS in Computer Science, Dire Dawa University, Ethiopia.",
    industry: "Technology",
    years: "7 years of tech consulting",
    services: tangoServices,
    serviceAreas: "Remote · serving clients everywhere",
    remote: true,
    searchTerms: "cloud ai website software technology consulting",
    email: SITE_EMAIL,
    whatsapp: SITE_WHATSAPP,
    website: RESUME_URL || null,
    github: TANGO_GITHUB,
    linkedin: TANGO_LINKEDIN,
  },
  {
    slug: "gatbel-chamjock",
    name: "Dr. Gatbel Nyak Chamjock, DrPH, MPAS, PA-C",
    category: "medical",
    categoryLabel: "Medical",
    line: "Doctor · Epidemiologist · Health Educator",
    businessName: null,
    serviceTypes: ["Charity"],
    location: null,
    image: {
      src: "/images/gatbel/gatbel-coat.webp",
      alt: "Dr. Gatbel Nyak Chamjock.",
      width: 900,
      height: 1125,
    },
    photos: [
      {
        src: "/images/gatbel/gatbel-coat.webp",
        alt: "Dr. Gatbel Nyak Chamjock.",
        width: 900,
        height: 1125,
      },
    ],
    placeholder: false,
    comingSoon: false,
    profession: "Doctor · Epidemiologist · Health Educator",
    credentialBadges: ["DrPH", "MPAS", "PA-C"],
    experience: [
      {
        title: "Epidemiologist and health educator",
        detail:
          "Teaches preventive health to the community, including on social media such as Facebook, in person around Iowa, and remotely through telehealth and online lessons.",
      },
      {
        title: "Gambella Medical Team Connection",
        detail: "Board member and medical team lead.",
      },
      {
        title: "Emergency care in Waterloo, Iowa",
        detail:
          "Also practices as a board-certified physician assistant (PA-C) in emergency medicine, working in emergency care in Waterloo, Iowa.",
      },
      {
        title: "Patients in Iowa, Nebraska, and Colorado",
        detail: "Has served patients in Iowa, Nebraska and Colorado.",
      },
    ],
    titles: [
      {
        title: "Doctor of Public Health",
        detail: "DrPH, Capella University, Minneapolis, Minnesota.",
      },
      {
        title: "Epidemiologist",
        detail: "Epidemiologist.",
      },
      {
        title: "Health Educator",
        detail: "Health Educator.",
      },
      {
        title: "MPAS",
        detail: "Master of Physician Assistant Studies, Union College in Lincoln, Nebraska.",
      },
      {
        title: "PA-C",
        detail: "Board-certified physician assistant.",
      },
      {
        title: "Board member and medical team lead",
        detail: "Gambella Medical Team Connection.",
      },
      {
        title: "Bachelor's degree in biology",
        detail: "Tennessee State University.",
      },
    ],
    school: null,
    industry: null,
    years: null,
    services: [
      {
        name: "Preventive health education",
        line: "Lessons on staying well, for the community.",
        slides: ["heart", "book", "shield"],
      },
      {
        name: "Telehealth consultations",
        line: "Visits by telehealth.",
        slides: ["monitor", "globe", "heart"],
      },
      {
        name: "Community health lessons",
        line: "In person around Iowa or online.",
        slides: ["book", "monitor", "globe"],
      },
    ],
    serviceAreas: "Iowa (in person) · Remote telehealth anywhere",
    email: "gchamjock@gmail.com",
    whatsapp: "https://wa.me/19705207160",
    website: "https://gambellamed.org/board-members/",
    websiteLabel: "Public profile",
    github: null,
    linkedin: null,
    remote: true,
    searchTerms: "physician assistant emergency medicine telehealth preventive health Iowa Waterloo",
    bio: "Dr. Gatbel Nyak Chamjock is a Doctor of Public Health, an epidemiologist, and a health educator. He holds a Doctor of Public Health (DrPH) from Capella University in Minneapolis, Minnesota. He teaches preventive health to the community, including on social media such as Facebook, in person around Iowa, and remotely through telehealth and online lessons. He is a board member and medical team lead for Gambella Medical Team Connection. He holds a Master of Physician Assistant Studies from Union College in Lincoln, Nebraska, and a bachelor's degree in biology from Tennessee State University. He also practices as a board-certified physician assistant (PA-C) in emergency medicine, working in emergency care in Waterloo, Iowa, and has served patients in Iowa, Nebraska and Colorado.",
    notice: "Information for general education. For emergencies call 911.",
  },
  {
    slug: "yat-auto-repair",
    name: "Yat Auto Repair",
    category: "auto",
    categoryLabel: "Auto",
    line: "Auto repair shop",
    businessName: "Yat Auto Repair",
    serviceTypes: ["Business"],
    phone: { label: "(402) 937-2554", href: "tel:+14029372554" },
    location: "105 5th Ave NE, Le Mars, IA 51031",
    image: {
      src: "/images/placeholders/auto-shop.svg",
      alt: "Wrench icon for Yat Auto Repair.",
      width: 800,
      height: 1000,
    },
    photos: [],
    placeholder: false,
    comingSoon: false,
    profession: "Auto repair shop",
    school: null,
    industry: null,
    years: null,
    serviceSummary: "From tires and brakes to engine work.",
    services: [
      { name: "Tires", line: "Mounting, balancing, rotation, and flat repair.", icon: "tire" },
      { name: "Oil changes and fluids", line: "Oil changes and fluid service.", icon: "oil" },
      { name: "Brakes", line: "Pads and rotors.", icon: "brake" },
      { name: "Batteries and electrical", line: "Batteries and electrical repair.", icon: "bolt" },
      { name: "Suspension and steering", line: "Suspension and steering.", icon: "steering" },
      { name: "Alignment", line: "Wheel alignment.", icon: "alignment" },
      { name: "Exhaust", line: "Exhaust work.", icon: "exhaust" },
      { name: "AC and heating", line: "Air conditioning and heating.", icon: "climate" },
      { name: "Diagnostics and check engine light", line: "Diagnostics and the check engine light.", icon: "pulse" },
      { name: "Transmission", line: "Transmission service.", icon: "transmission" },
      { name: "Engine repair", line: "Engine repair.", icon: "engine" },
    ],
    serviceAreas: "Le Mars, Iowa (in person)",
    email: null,
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
    remote: false,
    searchTerms: "",
    bio: "Full-service auto repair shop in Le Mars, Iowa, handling everything from tires and brakes to engine work.",
  },
  {
    slug: "taxation",
    name: "Taxation",
    category: "tax",
    categoryLabel: "Tax",
    line: "Coming soon.",
    businessName: null,
    serviceTypes: [],
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
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
    remote: false,
    searchTerms: "",
    photos: [],
  },
  {
    slug: "finance",
    name: "Finance",
    category: "finance",
    categoryLabel: "Finance",
    line: "Coming soon.",
    businessName: null,
    serviceTypes: [],
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
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
    remote: false,
    searchTerms: "",
    photos: [],
  },
];

export function getFeaturedPro(slug: string): PublicPro | undefined {
  return featuredPros.find((pro) => pro.slug === slug);
}

/** Real professionals who list this service. Placeholders are not included. */
export function professionalsForService(serviceId: string): PublicPro[] {
  const offer = getService(serviceId);
  if (!offer) return [];
  return featuredPros.filter(
    (pro) => !pro.placeholder && !pro.comingSoon && pro.services.some((service) => service.name === offer.name),
  );
}

export function proFromAccount(person: {
  id: string;
  fullName: string;
  profession: string;
  businessName: string;
  serviceArea: string;
  bio: string;
  website: string | null;
  email: string;
  serviceTypes?: ServiceType[];
}): PublicPro {
  const placeholder = person.bio.includes("PLACEHOLDER");
  return {
    slug: person.id,
    name: person.fullName,
    category: "tech",
    categoryLabel: person.profession || "Professional",
    line: placeholder ? "Placeholder." : person.businessName,
    businessName: person.businessName.trim() || null,
    serviceTypes: person.serviceTypes ?? [],
    location: person.serviceArea || null,
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
    serviceAreas: person.serviceArea || null,
    email: null,
    dedupeEmail: person.email || null,
    whatsapp: null,
    website: person.website,
    github: null,
    linkedin: null,
    remote: /\b(remote|worldwide|everywhere)\b/i.test(person.serviceArea),
    searchTerms: "",
    photos: [],
  };
}

/** Curated profiles win when an approved account uses the same email or name. */
export function mergeDirectory(curated: PublicPro[], approved: PublicPro[]): PublicPro[] {
  const emails = new Set(
    curated
      .flatMap((pro) => [pro.email, pro.dedupeEmail])
      .map((email) => email?.trim().toLowerCase())
      .filter((email): email is string => Boolean(email)),
  );
  const names = new Set(curated.filter((pro) => !pro.placeholder).map((pro) => pro.name.trim().toLowerCase()));
  const extra = approved.filter((pro) => {
    const email = (pro.dedupeEmail || pro.email)?.trim().toLowerCase();
    if (email && emails.has(email)) return false;
    if (names.has(pro.name.trim().toLowerCase())) return false;
    return true;
  });
  return [...curated, ...extra];
}

export type CategoryOption = { value: string; label: string };

/** Options come from the professionals in hand. A new category shows up on its own. */
export function categoryOptions(pros: PublicPro[]): CategoryOption[] {
  const labels = new Map<string, { label: string; real: boolean }>();
  for (const pro of pros) {
    const value = pro.category.trim();
    if (!value) continue;
    const real = !pro.placeholder && !pro.comingSoon;
    const current = labels.get(value);
    if (!current || (!current.real && real)) {
      labels.set(value, { label: pro.categoryLabel.trim() || value, real });
    }
  }
  const options = [...labels.entries()]
    .map(([value, item]) => ({ value, label: item.label }))
    .sort((a, b) => a.label.localeCompare(b.label));
  return [{ value: "", label: "All categories" }, ...options];
}

/** Professionals the directory lists when no filter is set. The homepage uses the same set. */
export function homepageProfessionals(pros: PublicPro[]): PublicPro[] {
  return filterPros(pros, {});
}

export function filterPros(
  pros: PublicPro[],
  query: { q?: string; category?: string; location?: string; type?: string },
): PublicPro[] {
  const keyword = (query.q ?? "").trim().toLowerCase();
  const category = (query.category ?? "").trim().toLowerCase();
  const location = (query.location ?? "").trim().toLowerCase();
  const type = SERVICE_TYPES.find((item) => item.toLowerCase() === (query.type ?? "").trim().toLowerCase());
  return pros.filter((pro) => {
    if (pro.placeholder || pro.comingSoon) return false;
    if (category) {
      const key = pro.category.trim().toLowerCase();
      const label = pro.categoryLabel.trim().toLowerCase();
      if (key !== category && label !== category) return false;
    }
    if (type && !pro.serviceTypes.includes(type)) return false;
    if (location && !pro.remote) {
      const where = `${pro.location ?? ""} ${pro.serviceAreas ?? ""}`.toLowerCase();
      if (!where.includes(location)) return false;
    }
    if (!keyword) return true;
    const name = pro.name.toLowerCase();
    const business = (pro.businessName ?? "").trim().toLowerCase();
    const serviceWords = pro.services.flatMap((service) =>
      `${service.name} ${service.line}`.toLowerCase().split(/[^a-z0-9]+/),
    );
    const words = keyword.split(/[^a-z0-9]+/).filter(Boolean);
    const servicesMatch = words.length > 0 && words.every((word) => serviceWords.includes(word));
    return name.includes(keyword) || (business.length > 0 && business.includes(keyword)) || servicesMatch;
  });
}
