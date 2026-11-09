const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WEBSITE = /^https?:\/\/\S+$/i;
const CATEGORY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function cleanText(value: string, max: number): string {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function cleanMultiline(value: string, max: number): string {
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

export function validateEmail(value: string): string | null {
  const email = value.trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 160) return null;
  return email;
}

export function validatePassword(value: string): string | null {
  if (value.length < 8 || value.length > 72) return null;
  return value;
}

export function validateWebsite(value: string): string | null {
  const website = value.trim();
  if (!website) return "";
  if (!WEBSITE.test(website) || website.length > 200) return null;
  return website;
}

export function validateCategory(value: string): string | null {
  const category = value.trim().toLowerCase();
  if (!category) return "";
  if (!CATEGORY.test(category) || category.length > 40) return null;
  return category;
}
