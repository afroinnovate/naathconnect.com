import type { ConsultationProfile, GalleryImage, Profile } from "./types";

/**
 * House consultation profiles ship with the site.
 * Approved directory professionals can join a category later without a
 * code change: an admin sets consultation_category and featured_consultation.
 *
 * Gatbel's published profile uses his headshot and the wording he approved.
 * Do not call him Dr. Public records confirm physician assistant, not MD or DO.
 */
export const CATEGORY_LABELS: Record<string, string> = {
  technology: "Technology consultation",
  medical: "Medical consultation",
};

export function categoryLabel(slug: string, explicit?: string | null): string {
  if (explicit && explicit.trim()) return explicit.trim();
  if (CATEGORY_LABELS[slug]) return CATEGORY_LABELS[slug];
  return slug.replace(/-/g, " ");
}

const tangoPortrait: GalleryImage = {
  src: "/images/tango/tango-tech-consultation.jpg",
  srcSet: "/images/tango/tango-tech-consultation-750.jpg 750w, /images/tango/tango-tech-consultation.jpg 1122w",
  webpSrcSet: "/images/tango/tango-tech-consultation-750.webp 750w, /images/tango/tango-tech-consultation.webp 1122w",
  width: 1122,
  height: 1402,
  alt: "Tango Tew at a desk with a laptop, holding a mug. Monitors behind him show notes on systems, cloud, and AI. The wall reads: Build. Solve. Deploy. Improve. Make an impact.",
  caption: "Tango Tew. Discipline builds freedom.",
};

export function houseConsultations(): ConsultationProfile[] {
  return [
    {
      id: "house-tango",
      slug: "tango-tew",
      category: "technology",
      categoryLabel: CATEGORY_LABELS.technology,
      name: "Tango Tew",
      roleLine: "Engineer, consultant, problem solver.",
      headline: "Turning ideas into real-world impact.",
      summary:
        "Tango helps small business owners, community leaders, contractors, and truckers turn a real problem into something people can use. The work is impact-driven: build it, solve the problem, deploy it, and make a difference someone can feel. Better systems, brighter people.",
      principles: [
        "Build. Solve. Deploy. Improve. Make an impact.",
        "Better systems, brighter people.",
        "Faith, family, technology, and a better tomorrow.",
      ],
      pullQuote: "Discipline builds freedom.",
      specialty: null,
      credentials: null,
      contactNote: null,
      portrait: tangoPortrait,
      gallery: [],
      layout: "feature",
      placeholder: false,
      source: "house",
    },
    {
      id: "house-gatbel",
      slug: "gatbel-chamjock",
      category: "medical",
      categoryLabel: CATEGORY_LABELS.medical,
      name: "Dr. Gatbel Nyak Chamjock, MPAS, PA-C",
      roleLine: "Certified Physician Assistant, Emergency Medicine",
      headline: "Certified Physician Assistant, Emergency Medicine",
      summary:
        "Dr. Gatbel is a board-certified physician assistant who specializes in emergency medicine. He works in emergency care in Waterloo, Iowa, and has served patients in Iowa, Nebraska and Colorado. He holds a bachelor's degree in biology from Tennessee State University and a Master of Physician Assistant Studies from Union College in Lincoln, Nebraska. He is a board member and medical team lead for Gambella Medical Team Connection, and he teaches preventive health to the community, including on social media such as Facebook, in person around Iowa, and remotely through telehealth and online lessons.",
      principles: [],
      pullQuote: null,
      specialty: "Emergency medicine",
      credentials: "MPAS, PA-C",
      contactNote: null,
      portrait: {
        src: "/images/gatbel/gatbel-headshot.webp",
        alt: "Dr. Gatbel Nyak Chamjock.",
        width: 323,
        height: 431,
        caption: "Dr. Gatbel Nyak Chamjock.",
      },
      gallery: [
        {
          src: "/images/gatbel/gatbel-headshot.webp",
          alt: "Dr. Gatbel Nyak Chamjock.",
          width: 323,
          height: 431,
          caption: "Dr. Gatbel Nyak Chamjock.",
        },
      ],
      layout: "profile",
      placeholder: false,
      source: "house",
    },
  ];
}

export function profileToConsultation(profile: Profile): ConsultationProfile {
  const category = profile.consultationCategory || "general";
  return {
    id: profile.id,
    slug: profile.id,
    category,
    categoryLabel: categoryLabel(category, profile.consultationCategoryLabel),
    name: profile.fullName,
    roleLine: profile.profession,
    headline: profile.consultationHeadline || profile.businessName,
    summary: profile.bio,
    principles: [],
    pullQuote: null,
    specialty: profile.specialty,
    credentials: profile.credentials,
    contactNote: profile.contactNote,
    portrait: profile.gallery[0] ?? null,
    gallery: profile.gallery,
    layout: "profile",
    placeholder: profile.bio.includes("PLACEHOLDER"),
    source: "directory",
  };
}

export function mergeConsultations(
  house: ConsultationProfile[],
  directory: ConsultationProfile[],
): ConsultationProfile[] {
  const slugs = new Set(house.map((profile) => profile.slug));
  return [...house, ...directory.filter((profile) => !slugs.has(profile.slug))];
}

export function groupConsultations(profiles: ConsultationProfile[]): {
  category: string;
  label: string;
  profiles: ConsultationProfile[];
}[] {
  const order = ["technology", "medical"];
  const groups = new Map<string, ConsultationProfile[]>();
  for (const profile of profiles) {
    const list = groups.get(profile.category) ?? [];
    list.push(profile);
    groups.set(profile.category, list);
  }
  return [...groups.keys()]
    .sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    })
    .map((category) => {
      const list = groups.get(category) ?? [];
      return { category, label: list[0]?.categoryLabel ?? categoryLabel(category), profiles: list };
    });
}
