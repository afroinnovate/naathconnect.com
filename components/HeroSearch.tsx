import { SEARCH_CATEGORIES } from "@/lib/site";

export function HeroSearch({
  q = "",
  category = "",
  location = "",
}: {
  q?: string;
  category?: string;
  location?: string;
}) {
  return (
    <form className="search" action="/directory" method="get">
      <label>
        <span className="sr-only">Category</span>
        <select name="category" defaultValue={category} aria-label="Category">
          {SEARCH_CATEGORIES.map((item) => (
            <option key={item.value || "all"} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">Keyword</span>
        <input name="q" defaultValue={q} placeholder="Keyword" aria-label="Keyword" />
      </label>
      <label>
        <span className="sr-only">Location</span>
        <input name="location" defaultValue={location} placeholder="Location" aria-label="Location" />
      </label>
      <button type="submit">Search</button>
    </form>
  );
}
