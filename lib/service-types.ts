/** Directory service types. An empty list means the type is unknown. Do not guess one. */
export const SERVICE_TYPES = ["Business", "Free/Volunteer", "Charity"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

const ALLOWED = new Set<string>(SERVICE_TYPES);

/** Accepts a Postgres text[], a JS array, or nothing. Missing and unknown values become []. */
export function parseServiceTypes(value: unknown): ServiceType[] {
  const items = rawServiceTypes(value);
  const found = new Set<ServiceType>();
  for (const item of items) {
    const text = item.trim();
    if (ALLOWED.has(text)) found.add(text as ServiceType);
  }
  return SERVICE_TYPES.filter((type) => found.has(type));
}

function rawServiceTypes(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value !== "string") return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((part) => part.trim().replace(/^"|"$/g, ""));
  }
  return trimmed.split(",");
}
