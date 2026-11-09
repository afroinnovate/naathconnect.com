const PRODUCTION_ORIGIN = "https://naathconnect.com";

/** True on Amplify Hosting build and compute. Those containers set these. */
export function isAmplifyHosting(): boolean {
  return Boolean(process.env.AWS_APP_ID || process.env.AWS_BRANCH);
}

/** Indexing stays off until this is exactly "true". */
export function allowIndexing(): boolean {
  return process.env.ALLOW_INDEXING?.trim().toLowerCase() === "true";
}

/** Header value for pages and assets. Null when indexing is allowed. */
export function robotsTag(): string | null {
  return allowIndexing() ? null : "noindex, nofollow";
}

/**
 * Public origin for metadata. `NEXT_PUBLIC_SITE_URL` wins when it is an
 * http(s) URL. Amplify's main branch otherwise uses the apex. Other
 * environments use localhost so a laptop build does not claim the live host.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  if (/^https?:\/\//i.test(configured)) return configured;
  if (process.env.AWS_BRANCH === "main") return PRODUCTION_ORIGIN;
  return "http://localhost:3000";
}

/** Send www.naathconnect.com to the apex. Other hosts stay put. */
export function canonicalRedirectUrl(hostHeader: string | null, pathname: string, search: string): string | null {
  const host = (hostHeader ?? "").toLowerCase().split(":")[0];
  if (host !== "www.naathconnect.com") return null;
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${PRODUCTION_ORIGIN}${path}${search}`;
}

export function isDemoMode(): boolean {
  if (isAmplifyHosting()) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return !url || !key;
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !anonKey) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. The SQLite demo runs only on a local `npm run dev`, not on Amplify.",
    );
  }
  return { url, anonKey };
}

export function demoAdminEmail(): string {
  return (process.env.DEMO_ADMIN_EMAIL || "placeholder-admin@example.invalid").trim().toLowerCase();
}

export function demoAdminPassword(): string {
  return process.env.DEMO_ADMIN_PASSWORD || "placeholder-admin-password";
}

export function demoProfessionalPassword(): string {
  return process.env.DEMO_PROFESSIONAL_PASSWORD || "placeholder-professional-password";
}

export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/account";
  }
  return value;
}
