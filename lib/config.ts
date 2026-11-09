export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return !url || !key;
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
