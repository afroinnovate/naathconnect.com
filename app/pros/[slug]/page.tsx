import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProView } from "@/components/ProView";
import { Testimonials } from "@/components/Testimonials";
import { getFeaturedPro, proFromAccount } from "@/lib/featured-pros";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const featured = getFeaturedPro(slug);
  if (featured) return { title: featured.name };
  return { title: "Professional" };
}

export default async function ProfessionalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ testimonial?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const featured = getFeaturedPro(slug);
  const session = await getSession();
  const store = await getStore();

  if (featured) {
    return (
      <>
        <ProView pro={featured} />
        <Testimonials items={[]} canEdit={false} profileId={slug} notice={query.testimonial} />
      </>
    );
  }

  const person = (await store.listApprovedProfessionals()).find((item) => item.id === slug);
  if (!person) notFound();
  const items = await store.listTestimonials(person.id);
  const canEdit = Boolean(session && session.id === person.id && session.status === "approved");
  return (
    <>
      <ProView pro={proFromAccount(person)} />
      <Testimonials items={items} canEdit={canEdit} profileId={person.id} notice={query.testimonial} />
    </>
  );
}
