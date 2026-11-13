import { getService, serviceOffers } from "./services";
import { SERVICE_TYPES, type ServiceType } from "./service-types";
import { RESUME_URL, SITE_EMAIL, SITE_WHATSAPP, TANGO_GITHUB, TANGO_LINKEDIN } from "./site";

export type ServiceTile = {
  name: string;
  line: string;
  slides?: readonly string[];
  /** Compact icon for a shop service. These do not open a service page. */
  icon?: string;
  /** Groups plain-language help, instead of a shop icon or a slideshow. */
  group?: string;
};

export type PublicImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Overrides the shared card crop when a portrait needs a different anchor. */
  position?: string;
  /** Use contain when the whole mark should stay visible inside the tile. */
  fit?: "cover" | "contain";
};

export type ProfileReference = {
  label: string;
  text: string;
  href: string;
};

export type OrgProgram = { name: string; line: string };

export type OrgProgramGroup = { name: string; items: readonly OrgProgram[] };

export type OrganizationProfile = {
  heading: string;
  mission: string;
  summary: string;
  mark?: PublicImage;
  groups: readonly OrgProgramGroup[];
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
  image: PublicImage;
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
  /** Whole-word aliases for the directory name search. */
  keywords?: string;
  /** Shows "Remote services available" without matching every location. */
  offersRemote?: boolean;
  photos: PublicImage[];
  /** Wide organization mark shown above the profile title. */
  wordmark?: PublicImage;
  /** Quoted mission, shown once. */
  mission?: string;
  /** Sentences in the organization's own words. */
  statements?: readonly string[];
  /** Link to a related directory listing. */
  reference?: ProfileReference;
  /** Short labeled facts, such as an EIN. */
  records?: readonly { label: string; value: string }[];
  /** Organization programs shown after the person's own services. */
  organization?: OrganizationProfile | null;
  bio?: string | null;
  notice?: string | null;
  /** Founder line, shown on the profile when set. */
  founder?: string | null;
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
    slug: "lam-tax-service",
    name: "Lam Tax Service, LLC",
    category: "tax",
    categoryLabel: "Tax",
    line: "Tax preparation, bookkeeping and payroll in St. Cloud, MN",
    businessName: "Lam Tax Service, LLC",
    serviceTypes: ["Business"],
    location: "22 Wilson Ave NE, Suite 201, St. Cloud, MN 56304",
    image: {
      src: "/images/lam/lam-portrait.webp",
      alt: "Lam Chuol.",
      width: 523,
      height: 630,
    },
    photos: [],
    placeholder: false,
    comingSoon: false,
    profession: null,
    school: null,
    industry: null,
    years: null,
    founder: "Lam Chuol, founder (est. 2016)",
    services: [
      { name: "Personal tax returns", line: "W-2 and 1099.", icon: "file" },
      { name: "Small business taxes", line: "LLC, partnership 1065, S-Corp 1120S, and C-Corp 1120.", icon: "folder" },
      { name: "MN property tax and renter refunds", line: "Minnesota property tax and renter refunds.", icon: "refund" },
      { name: "Bookkeeping", line: "Bookkeeping for small businesses.", icon: "book" },
      { name: "Payroll", line: "Payroll.", icon: "card" },
      { name: "QuickBooks setup and training", line: "QuickBooks setup and training.", icon: "monitor" },
      { name: "Sales tax reporting", line: "Sales tax reporting.", icon: "archive" },
      { name: "Accounts payable and receivable", line: "Accounts payable and receivable.", icon: "layers" },
      { name: "Monthly financial statements", line: "Monthly financial statements.", icon: "calendar" },
      { name: "Business entity selection", line: "Business entity selection.", icon: "puzzle" },
    ],
    serviceAreas: "St. Cloud, Minnesota (in person)",
    email: "info@lamtaxservice.com",
    whatsapp: null,
    website: "https://lamtaxservice.com",
    websiteLabel: "Website",
    github: null,
    linkedin: null,
    remote: false,
    offersRemote: true,
    searchTerms: "Saint Cloud",
    keywords: "tax filing filling Minnesota MN remote services",
    bio: "Lam Tax Service, LLC was founded in 2016 by Lam Chuol, who brings more than four years of experience at H&R Block and a Bachelor of Science in Accounting from Ohio Valley University. The firm serves individuals and small businesses with accurate, affordable tax and accounting services. In 2023 it received the Initiative Foundation's New Business of the Year award.",
  },
  {
    slug: "gatluak-thach",
    name: "Dr. Gatluak Ter Thach, PhD",
    category: "ngo",
    categoryLabel: "NGO / Social Empowerment",
    line: "NGO Leadership · Finance · Grant Writing Educator",
    businessName: null,
    serviceTypes: ["Business", "Free/Volunteer"],
    location: "Nashville, TN",
    image: {
      src: "/images/gatluak/gatluak-thach.webp",
      alt: "Dr. Gatluak Ter Thach.",
      width: 1080,
      height: 1080,
      position: "center",
    },
    photos: [],
    placeholder: false,
    comingSoon: false,
    profession: "Educator for NGO leadership and finance",
    school: null,
    industry: null,
    years: null,
    credentialBadges: ["PhD"],
    titles: [
      {
        title: "Founder, President and CEO",
        detail: "Nashville International Center for Empowerment (NICE), established in 2005.",
      },
      {
        title: "White House Champion of Change for World Refugees",
        detail: "Honored in 2015.",
      },
      {
        title: "PhD in Organizational Leadership",
        detail: "Emphasis on strategic planning. Argosy University, Nashville, Tennessee, 2014.",
      },
      {
        title: "Master's degree in public service",
        detail: "Cumberland University, Lebanon, Tennessee. Member of Pi Gamma Mu International Honor Society. Graduation year is not stated on the official biography.",
      },
      {
        title: "B.S. in computer science",
        detail: "Minor in mathematics. Tennessee State University, Nashville, Tennessee, 2003.",
      },
      {
        title: "Author",
        detail: "My New American Dream.",
      },
    ],
    services: [
      {
        name: "Start an Organization / NGO Leadership",
        line: "Free. Help to start an organization and form its NGO leadership.",
        slides: ["compass", "layers", "bulb"],
      },
      {
        name: "Strategic Planning & NGO Budgeting",
        line: "Free. Strategic planning, budgeting, and finance so an NGO can last.",
        slides: ["calendar", "card", "check"],
      },
      {
        name: "PhD Mentorship",
        line: "Mentoring PhD students.",
        slides: ["book", "chat", "heart"],
      },
      {
        name: "Grant Proposal Writing",
        line: "Paid grant proposal writing.",
        slides: ["file", "folder", "check"],
      },
      {
        name: "Grant Writing Training",
        line: "Paid teaching on how to write grant proposals.",
        slides: ["monitor", "book", "chat"],
      },
    ],
    serviceAreas: null,
    email: null,
    whatsapp: null,
    website: null,
    github: null,
    linkedin: null,
    remote: false,
    searchTerms: "",
    keywords: "gatluak thach grant writing proposal ngo leadership strategic planning budgeting finance mentorship phd nashville tn",
    bio: "Dr. Gatluak Ter Thach, PhD, teaches NGO leadership and finance. A Sudanese refugee leader, he came to the United States in 1996 and co-founded NICE in 2005. In 2015 he was named a White House Champion of Change for World Refugees.",
    reference: {
      label: "Affiliation",
      text: "Founder & President/CEO of NICE",
      href: "/pros/nice-empower-nashville",
    },
  },
  {
    slug: "nice-empower-nashville",
    name: "Nashville International Center for Empowerment (NICE)",
    category: "ngo",
    categoryLabel: "NGO / Social Empowerment",
    line: "Everyone deserves a chance to thrive.",
    businessName: null,
    serviceTypes: ["Charity", "Free/Volunteer"],
    location: "417 Welshwood Drive, Ste. 100, Nashville, TN 37211",
    image: {
      src: "/images/gatluak/nice-icon.webp",
      alt: "Nashville International Center for Empowerment icon.",
      width: 512,
      height: 512,
      position: "center",
      fit: "contain",
    },
    wordmark: {
      src: "/images/gatluak/nice-wordmark.webp",
      alt: "Nashville International Center for Empowerment.",
      width: 750,
      height: 150,
    },
    photos: [],
    placeholder: false,
    comingSoon: false,
    profession: null,
    school: null,
    industry: null,
    years: null,
    services: [
      {
        name: "Social Services",
        line: "Case management, benefits, and practical help for refugees and immigrants, including a Gallatin office.",
        slides: ["heart", "shield", "compass"],
      },
      {
        name: "Education",
        line: "ESL and other classes for adults, plus school support and youth programs.",
        slides: ["book", "monitor", "globe"],
      },
      {
        name: "Employment",
        line: "One-on-one help toward a job, and introductions to local employers.",
        slides: ["card", "check", "chat"],
      },
      {
        name: "Immigration Services",
        line: "Affordable help with citizenship, Green Cards, and other immigration papers.",
        slides: ["file", "globe", "check"],
      },
      {
        name: "Health",
        line: "Health education, finding care, and support for mothers and young children.",
        slides: ["heart", "pulse", "shield"],
      },
      {
        name: "Community / Family Mentorship",
        line: "Mentors and community programs that help new families settle in.",
        slides: ["heart", "chat", "book"],
      },
    ],
    serviceAreas: "Middle Tennessee",
    email: null,
    whatsapp: null,
    website: "https://www.empowernashville.org/",
    websiteLabel: "See all programs on empowernashville.org",
    github: null,
    linkedin: null,
    remote: false,
    searchTerms: "Gallatin",
    keywords: "nice empower nashville refugee immigrant nonprofit ngo tennessee tn esl employment immigration youth",
    mission: "To ensure refugees and immigrants achieve their full potential now and for generations to come.",
    statements: [
      "Since 2005, NICE has helped refugees and immigrants find housing, work, and belonging in Middle Tennessee — because no one should have to build a new life alone.",
      "Nashville International Center for Empowerment (NICE) is a 501(c)(3) nonprofit organization based in South Nashville.",
      "NICE is an affiliate of ECDC.",
      "Formerly known as Sudanese Community & Women's Service Center.",
    ],
    records: [{ label: "EIN", value: "02-0674431" }],
    reference: {
      label: "Point of contact",
      text: "Dr. Gatluak Ter Thach, PhD, Founder & President/CEO",
      href: "/pros/gatluak-thach",
    },

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
  {
    slug: "auto",
    name: "Auto",
    category: "auto",
    categoryLabel: "Auto",
    line: "Coming soon.",
    businessName: null,
    serviceTypes: [],
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

function placeHaystack(pro: PublicPro): string {
  const raw = `${pro.location ?? ""} ${pro.serviceAreas ?? ""} ${pro.searchTerms}`.toLowerCase();
  return raw.replace(/\bst\.?\s+cloud\b/g, "st. cloud st cloud saint cloud");
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
      const where = placeHaystack(pro);
      const wanted = location.replace(/\bsaint\s+cloud\b/g, "saint cloud");
      if (!where.includes(wanted)) return false;
    }
    if (!keyword) return true;
    const name = pro.name.toLowerCase();
    const business = (pro.businessName ?? "").trim().toLowerCase();
    const orgWords = (pro.organization?.groups ?? []).flatMap((group) =>
      group.items.flatMap((item) => `${group.name} ${item.name} ${item.line}`.toLowerCase().split(/[^a-z0-9]+/)),
    );
    const serviceWords = [
      ...pro.services.flatMap((service) => `${service.group ?? ""} ${service.name} ${service.line}`.toLowerCase().split(/[^a-z0-9]+/)),
      ...orgWords,
    ];
    const keywordWords = (pro.keywords ?? "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const words = keyword.split(/[^a-z0-9]+/).filter(Boolean);
    const servicesMatch = words.length > 0 && words.every((word) => serviceWords.includes(word));
    const keywordsMatch = words.length > 0 && words.every((word) => keywordWords.includes(word));
    return name.includes(keyword) || (business.length > 0 && business.includes(keyword)) || servicesMatch || keywordsMatch;
  });
}
