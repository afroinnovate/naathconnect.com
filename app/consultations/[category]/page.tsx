import { redirect } from "next/navigation";

const routes: Record<string, string> = {
  technology: "/pros/tango-tew",
  medical: "/pros/gatbel-chamjock",
};

export default async function ConsultationCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  redirect(routes[category] ?? "/directory");
}
