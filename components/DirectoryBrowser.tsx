"use client";

import { useEffect, useRef, useState } from "react";
import { HeroSearch } from "@/components/HeroSearch";
import { ProTile } from "@/components/ProTile";
import { filterPros, type CategoryOption, type PublicPro } from "@/lib/featured-pros";
import { SERVICE_TYPES } from "@/lib/service-types";

const TEXT_DEBOUNCE_MS = 250;

export type DirectoryFields = {
  q: string;
  category: string;
  location: string;
  type: string;
};

function categoryValue(value: string, categories: CategoryOption[]): string {
  const wanted = value.trim().toLowerCase();
  if (!wanted) return "";
  const found = categories.find(
    (item) => item.value.toLowerCase() === wanted || item.label.toLowerCase() === wanted,
  );
  return found?.value ?? value.trim();
}

function typeValue(value: string): string {
  const found = SERVICE_TYPES.find((item) => item.toLowerCase() === value.trim().toLowerCase());
  return found ?? "";
}

function fieldsFrom(initial: Partial<DirectoryFields>, categories: CategoryOption[]): DirectoryFields {
  return {
    q: initial.q ?? "",
    category: categoryValue(initial.category ?? "", categories),
    location: initial.location ?? "",
    type: typeValue(initial.type ?? ""),
  };
}

function writeDirectoryUrl(fields: DirectoryFields) {
  const params = new URLSearchParams();
  if (fields.category) params.set("category", fields.category);
  if (fields.type) params.set("type", fields.type);
  if (fields.q.trim()) params.set("q", fields.q.trim());
  if (fields.location.trim()) params.set("location", fields.location.trim());
  const query = params.toString();
  const url = query ? `/directory?${query}` : "/directory";
  window.history.replaceState(null, "", url);
}

export function DirectoryBrowser({
  pros,
  categories,
  initial,
}: {
  pros: PublicPro[];
  categories: CategoryOption[];
  initial: Partial<DirectoryFields>;
}) {
  const starting = fieldsFrom(initial, categories);
  const [fields, setFields] = useState(starting);
  const [applied, setApplied] = useState(starting);
  const fieldsRef = useRef(starting);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function publish(next: DirectoryFields, immediate: boolean) {
    fieldsRef.current = next;
    setFields(next);
    if (timer.current) clearTimeout(timer.current);
    if (immediate) {
      setApplied(next);
      writeDirectoryUrl(next);
      return;
    }
    timer.current = setTimeout(() => {
      const latest = fieldsRef.current;
      setApplied(latest);
      writeDirectoryUrl(latest);
    }, TEXT_DEBOUNCE_MS);
  }

  function onField(field: "category" | "type" | "q" | "location", value: string) {
    const next = { ...fieldsRef.current, [field]: value };
    publish(next, field === "category" || field === "type");
  }

  const people = filterPros(pros, applied);
  const searching = Boolean(applied.q.trim() || applied.category.trim() || applied.location.trim() || applied.type.trim());
  const comingSoon = searching ? [] : pros.filter((pro) => pro.placeholder || pro.comingSoon);

  return (
    <>
      <HeroSearch
        q={fields.q}
        category={fields.category}
        location={fields.location}
        type={fields.type}
        categories={categories}
        onField={onField}
        onSearch={() => publish(fieldsRef.current, true)}
      />
      {people.length === 0 ? <p className="hero-line">No professionals match.</p> : null}
      <div className="tiles">
        {people.map((pro) => (
          <ProTile key={pro.slug} pro={pro} />
        ))}
      </div>
      {comingSoon.length > 0 ? (
        <div className="coming-soon">
          <h2>Coming soon</h2>
          <div className="tiles">
            {comingSoon.map((pro) => (
              <ProTile key={pro.slug} pro={pro} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
