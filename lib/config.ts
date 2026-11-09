/** True on Amplify Hosting build and compute. Those containers set these. */
export function isAmplifyHosting(): boolean {
  return Boolean(process.env.AWS_APP_ID || process.env.AWS_BRANCH);
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
