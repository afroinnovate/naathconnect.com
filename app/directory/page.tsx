import type { Metadata } from "next";
import { DirectoryBrowser } from "@/components/DirectoryBrowser";
import { categoryOptions, featuredPros, mergeDirectory, proFromAccount } from "@/lib/featured-pros";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "Directory" };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; location?: string; type?: string }>;
}) {
  const params = await searchParams;
  const store = await getStore();
  const approved = (await store.listApprovedProfessionals()).map(proFromAccount);
  const merged = mergeDirectory(featuredPros, approved);

  return (
    <section className="section">
      <h1>Directory</h1>
      <DirectoryBrowser
        pros={merged}
        categories={categoryOptions(merged)}
        initial={{
          q: params.q ?? "",
          category: params.category ?? "",
          location: params.location ?? "",
          type: params.type ?? "",
        }}
      />
    </section>
  );
}
