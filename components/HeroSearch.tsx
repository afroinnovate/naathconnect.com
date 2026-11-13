import type { CategoryOption } from "@/lib/featured-pros";
import { SERVICE_TYPES } from "@/lib/service-types";

export function HeroSearch({
  q = "",
  category = "",
  location = "",
  type = "",
  categories,
}: {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  categories: CategoryOption[];
}) {
  return (
    <form className="search" action="/directory" method="get">
      <label>
        <span className="sr-only">All categories</span>
        <select name="category" defaultValue={category} aria-label="All categories">
          {categories.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">All service types</span>
        <select name="type" defaultValue={type} aria-label="All service types">
          <option value="">All service types</option>
          {SERVICE_TYPES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Name</span>
        <input name="q" defaultValue={q} placeholder="Name" aria-label="Name" />
      </label>
      <label>
        <span className="sr-only">Location</span>
        <input name="location" defaultValue={location} placeholder="Location" aria-label="Location" />
      </label>
      <button type="submit">Search</button>
    </form>
  );
}
