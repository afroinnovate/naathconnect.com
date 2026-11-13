import type { ServiceType } from "./service-types";

export type Role = "admin" | "professional" | "member";
export type Status = "pending" | "approved" | "rejected";
export type ReactionKind = "like" | "heart";

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
  srcSet?: string;
  webpSrcSet?: string;
};

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  businessName: string;
  profession: string;
  serviceArea: string;
  bio: string;
  website: string | null;
  publicContact: string | null;
  status: Status;
  role: Role;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
  consultationCategory: string | null;
  consultationCategoryLabel: string | null;
  consultationHeadline: string | null;
  specialty: string | null;
  credentials: string | null;
  contactNote: string | null;
  gallery: GalleryImage[];
  featuredConsultation: boolean;
  /** Empty when the column is missing or no type has been set. */
  serviceTypes: ServiceType[];
};

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  status: Status;
  businessName: string;
};

export type EventItem = {
  id: string;
  professionalId: string;
  professionalName: string;
  businessName: string;
  profession: string;
  professionalStatus: Status;
  title: string;
  summary: string;
  body: string;
  startsAt: string;
  locationLabel: string;
  status: Status;
  viewCount: number;
  likeCount: number;
  heartCount: number;
  viewerHasLike: boolean;
  viewerHasHeart: boolean;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  businessName: string;
  profession: string;
  serviceArea: string;
  bio: string;
  website: string;
  publicContact: string;
};

export type CreateEventInput = {
  professionalId: string;
  title: string;
  summary: string;
  body: string;
  startsAt: string;
  locationLabel: string;
};

export type ConsultationInput = {
  category: string;
  categoryLabel: string;
  featured: boolean;
  headline: string;
  specialty: string;
  credentials: string;
  contactNote: string;
  gallery: GalleryImage[];
};

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export type Testimonial = {
  id: string;
  profileId: string;
  quote: string;
  clientName: string;
  clientRole: string | null;
  givenOn: string | null;
};

export type TestimonialInput = {
  quote: string;
  clientName: string;
  clientRole: string;
  givenOn: string;
};

export type ConsultationProfile = {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  name: string;
  roleLine: string;
  headline: string;
  summary: string;
  principles: string[];
  pullQuote: string | null;
  specialty: string | null;
  credentials: string | null;
  contactNote: string | null;
  portrait: GalleryImage | null;
  gallery: GalleryImage[];
  layout: "feature" | "profile";
  placeholder: boolean;
  source: "house" | "directory";
};
