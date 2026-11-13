import type { CategoryOption } from "@/lib/featured-pros";
import { SERVICE_TYPES } from "@/lib/service-types";

export function HeroSearch({
  q = "",
  category = "",
  location = "",
  type = "",
  categories,
  onField,
  onSearch,
}: {
  q?: string;
  category?: string;
  location?: string;
  type?: string;
  categories: CategoryOption[];
  onField?: (field: "category" | "type" | "q" | "location", value: string) => void;
  onSearch?: () => void;
}) {
  return (
    <form
      className="search"
      action="/directory"
      method="get"
      onSubmit={(event) => {
        if (!onSearch) return;
        event.preventDefault();
        onSearch();
      }}
    >
      <label>
        <span className="sr-only">All categories</span>
        <select
          name="category"
          value={category}
          aria-label="All categories"
          onChange={(event) => onField?.("category", event.target.value)}
        >
          {categories.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">All service types</span>
        <select
          name="type"
          value={type}
          aria-label="All service types"
          onChange={(event) => onField?.("type", event.target.value)}
        >
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
        <input
          name="q"
          value={q}
          placeholder="Name"
          aria-label="Name"
          onChange={(event) => onField?.("q", event.target.value)}
        />
      </label>
      <label>
        <span className="sr-only">Location</span>
        <input
          name="location"
          value={location}
          placeholder="Location"
          aria-label="Location"
          onChange={(event) => onField?.("location", event.target.value)}
        />
      </label>
      <button type="submit">Search</button>
    </form>
  );
}
