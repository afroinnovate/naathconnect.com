import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConsultationSection } from "@/components/ConsultationSection";
import { groupConsultations } from "@/lib/consultations";
import { listConsultations } from "@/lib/store";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  return { title: category };
}

export default async function ConsultationCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const group = groupConsultations(await listConsultations()).find((item) => item.category === category);
  if (!group) notFound();
  return (
    <ConsultationSection
      category={group.category}
      label={group.label}
      profiles={group.profiles}
      showServices={group.category === "technology"}
    />
  );
}
