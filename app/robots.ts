import type { MetadataRoute } from "next";
import { allowIndexing } from "@/lib/config";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return { rules: [{ userAgent: "*", allow: "/" }] };
}
