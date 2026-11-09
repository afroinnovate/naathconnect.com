import type { ConsultationProfile, GalleryImage, Profile } from "./types";

/**
 * House consultation profiles ship with the site.
 * Approved directory professionals can join a category later without a
 * code change: an admin sets consultation_category and featured_consultation.
 *
 * Gatbel's photos: drop files in public/images/gatbel/ and replace `src`
 * below. Leave placeholder: true until Dr. Gatbel ChamJock has approved
 * the photos and the wording. Do not scrape social media.
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

const gatbelGallery: GalleryImage[] = [
  {
    src: "/images/gatbel/gown.svg",
    alt: "Placeholder graphic for a future photo of Dr. Gatbel ChamJock in a medical gown. This is not a photograph of him.",
    caption: "Placeholder — medical gown photo. Not a picture of Dr. Gatbel ChamJock.",
  },
  {
    src: "/images/gatbel/portrait.svg",
    alt: "Placeholder graphic for a future portrait of Dr. Gatbel ChamJock. This is not a photograph of him.",
    caption: "Placeholder — portrait. Not a picture of Dr. Gatbel ChamJock.",
  },
  {
    src: "/images/gatbel/practice.svg",
    alt: "Placeholder graphic for a future photo of Dr. Gatbel ChamJock at his practice. This is not a photograph of him.",
    caption: "Placeholder — at the practice. Not a picture of Dr. Gatbel ChamJock.",
  },
];

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
      name: "Dr. Gatbel ChamJock",
      roleLine: "Medical consultation",
      headline: "Placeholder — headline not yet written with Dr. Gatbel ChamJock.",
      summary:
        "Placeholder — biography not published. Tango will write this with Dr. Gatbel ChamJock. It stays a placeholder until Gatbel approves the wording and the photos.",
      principles: [],
      pullQuote: null,
      specialty: "Placeholder — specialty not published.",
      credentials: "Placeholder — credentials not published.",
      contactNote: "Placeholder — no phone number or email is published.",
      portrait: gatbelGallery[0],
      gallery: gatbelGallery,
      layout: "profile",
      placeholder: true,
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
