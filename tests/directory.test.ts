import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { categoryOptions, featuredPros, filterPros, homepageProfessionals, type PublicPro } from "../lib/featured-pros";
import { HOME_PURPOSE, HOME_QUOTE, HOME_QUOTE_ATTRIBUTION, HOME_QUOTE_GLOSS } from "../lib/home";
import { openSqliteStore } from "../lib/sqlite-store";
import { parseServiceTypes } from "../lib/service-types";

function withName(pro: PublicPro, slug: string, name: string, businessName: string | null): PublicPro {
  return { ...pro, slug, name, businessName, placeholder: false, comingSoon: false };
}

describe("directory filters", () => {
  it("builds the category dropdown from the professionals, not a fixed list", () => {
    const options = categoryOptions(featuredPros);
    assert.equal(options[0]?.label, "All");
    assert.equal(options[0]?.value, "");
    const values = options.map((option) => option.value);
    assert.ok(values.includes("tech"));
    assert.ok(values.includes("medical"));
    assert.ok(values.includes("tax"));
    assert.equal(values.includes("education"), false);
    assert.equal(new Set(values).size, values.length);

    const withoutMedical = featuredPros.filter((pro) => pro.category !== "medical");
    assert.equal(categoryOptions(withoutMedical).some((option) => option.value === "medical"), false);

    const added = categoryOptions([
      ...featuredPros,
      { ...featuredPros[0], slug: "new-law", category: "law", categoryLabel: "Law" },
    ]);
    assert.deepEqual(
      added.find((option) => option.value === "law"),
      { value: "law", label: "Law" },
    );
  });

  it("filters by one or more service types and leaves an empty type under All only", () => {
    const volunteer = filterPros(featuredPros, { type: "Free/Volunteer" }).map((pro) => pro.slug);
    const business = filterPros(featuredPros, { type: "Business" }).map((pro) => pro.slug);
    const charity = filterPros(featuredPros, { type: "Charity" }).map((pro) => pro.slug);
    assert.deepEqual(volunteer, ["tango-tew"]);
    assert.deepEqual(business, ["tango-tew"]);
    assert.deepEqual(charity, ["gatbel-chamjock"]);

    const unset = withName(featuredPros[2], "lam-tax-demo", "Lam Tax Service", "Lam Tax Service");
    unset.serviceTypes = [];
    const people = [...featuredPros, unset];
    assert.deepEqual(filterPros(people, { type: "Charity" }).map((pro) => pro.slug), ["gatbel-chamjock"]);
    assert.ok(filterPros(people, {}).some((pro) => pro.slug === "lam-tax-demo"));
    assert.equal(filterPros(people, { type: "Business" }).some((pro) => pro.slug === "lam-tax-demo"), false);

    assert.deepEqual(
      filterPros(featuredPros, { category: "medical", type: "Charity", q: "Gat" }).map((pro) => pro.slug),
      ["gatbel-chamjock"],
    );
    assert.deepEqual(filterPros(featuredPros, { category: "tech", type: "Charity" }).map((pro) => pro.slug), []);
    assert.deepEqual(
      filterPros(featuredPros, { category: "tech", type: "Business", location: "Nebraska" }).map((pro) => pro.slug),
      ["tango-tew"],
    );
  });

  it("matches a partial name or business name without regard to case", () => {
    const shop = withName(featuredPros[0], "ada-books", "Ada Okoth", "Bright Books");
    const people = [...featuredPros, shop];
    for (const keyword of ["Tang", "tango", "  Tango Tew "]) {
      assert.deepEqual(filterPros(people, { q: keyword }).map((pro) => pro.slug), ["tango-tew"], keyword);
    }
    assert.deepEqual(filterPros(people, { q: "Gat" }).map((pro) => pro.slug), ["gatbel-chamjock"]);
    assert.deepEqual(filterPros(people, { q: "bright" }).map((pro) => pro.slug), ["ada-books"]);
    assert.deepEqual(filterPros(people, { q: "okoth" }).map((pro) => pro.slug), ["ada-books"]);
    assert.deepEqual(filterPros(people, { q: "nomatch" }), []);
  });

  it("leaves demo accounts untyped when the column is missing or empty", () => {
    assert.deepEqual(parseServiceTypes(undefined), []);
    assert.deepEqual(parseServiceTypes(null), []);
    assert.deepEqual(parseServiceTypes(""), []);
    assert.deepEqual(parseServiceTypes(["Charity", "nope"]), ["Charity"]);
    assert.deepEqual(parseServiceTypes("{Business,\"Free/Volunteer\"}"), ["Business", "Free/Volunteer"]);
    const store = openSqliteStore(":memory:");
    const listed = store.listApprovedProfessionals();
    assert.equal(listed instanceof Promise, false);
    if (listed instanceof Promise) return;
    assert.ok(listed.length > 0);
    assert.equal(listed.every((person) => person.serviceTypes.length === 0), true);
  });
});

describe("homepage professionals", () => {
  it("lists the same people as the directory and links each tile to a profile", () => {
    const people = homepageProfessionals(featuredPros);
    assert.deepEqual(
      people.map((pro) => pro.slug),
      filterPros(featuredPros, {}).map((pro) => pro.slug),
    );
    assert.deepEqual(people.map((pro) => `/pros/${pro.slug}`), ["/pros/tango-tew", "/pros/gatbel-chamjock"]);
    assert.equal(people.some((pro) => pro.placeholder), false);

    const page = readFileSync("app/page.tsx", "utf8");
    const tile = readFileSync("components/ProTile.tsx", "utf8");
    assert.match(page, /<ProTile/);
    assert.match(page, /homepageProfessionals/);
    assert.doesNotMatch(page, /ServiceSlideshow|serviceOffers/);
    assert.match(page, /HOME_QUOTE/);
    assert.match(tile, /href=\{`\/pros\/\$\{pro\.slug\}`\}/);
    assert.equal(HOME_QUOTE, "Umuntu ngumuntu ngabantu.");
    assert.equal(HOME_QUOTE_GLOSS, "(A person is a person through other people.)");
    assert.equal(HOME_QUOTE_ATTRIBUTION, "Zulu proverb, the heart of the Ubuntu philosophy.");
    assert.match(HOME_PURPOSE, /Naath sons and daughters/);
  });
});
