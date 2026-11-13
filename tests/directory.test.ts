import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { categoryOptions, featuredPros, filterPros, homepageProfessionals, type PublicPro } from "../lib/featured-pros";
import { profileLinks } from "../components/ProfileLinks";
import { HOME_PURPOSE, HOME_QUOTE, HOME_QUOTE_ATTRIBUTION, HOME_QUOTE_CLOSE, HOME_QUOTE_GLOSS, HOME_QUOTE_OPEN } from "../lib/home";
import { openSqliteStore } from "../lib/sqlite-store";
import { parseServiceTypes } from "../lib/service-types";

function withName(pro: PublicPro, slug: string, name: string, businessName: string | null): PublicPro {
  return { ...pro, slug, name, businessName, placeholder: false, comingSoon: false };
}

describe("directory filters", () => {
  it("builds the category dropdown from the professionals, not a fixed list", () => {
    const options = categoryOptions(featuredPros);
    assert.equal(options[0]?.label, "All categories");
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
    assert.deepEqual(volunteer, ["tango-tew", "gatluak-thach"]);
    assert.deepEqual(business, ["tango-tew", "lam-tax-service", "gatluak-thach"]);
    assert.deepEqual(charity, ["gatbel-chamjock", "gatluak-thach"]);

    const unset = withName(featuredPros[2], "lam-tax-demo", "Lam Tax Service", "Lam Tax Service");
    unset.serviceTypes = [];
    const people = [...featuredPros, unset];
    assert.deepEqual(filterPros(people, { type: "Charity" }).map((pro) => pro.slug), ["gatbel-chamjock", "gatluak-thach"]);
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

  it("filters tiles from a category label or key as soon as it is chosen", () => {
    const slugs = (query: { q?: string; category?: string; location?: string; type?: string }) =>
      filterPros(featuredPros, query).map((pro) => pro.slug);
    assert.deepEqual(slugs({ category: "Medical" }), ["gatbel-chamjock"]);
    assert.deepEqual(slugs({ category: "medical" }), ["gatbel-chamjock"]);
    assert.deepEqual(slugs({ category: "TECH" }), ["tango-tew"]);
    assert.deepEqual(slugs({ category: "Tech" }), ["tango-tew"]);
    assert.deepEqual(slugs({ type: "Charity" }), ["gatbel-chamjock", "gatluak-thach"]);
    assert.deepEqual(slugs({ type: "business" }), ["tango-tew", "lam-tax-service", "gatluak-thach"]);
    assert.deepEqual(slugs({ q: "Tang" }), ["tango-tew"]);
    assert.deepEqual(slugs({}), ["tango-tew", "gatbel-chamjock", "lam-tax-service", "gatluak-thach"]);

    const renamed = featuredPros.map((pro) =>
      pro.slug === "gatbel-chamjock" ? { ...pro, category: "pa", categoryLabel: "Medical" } : pro,
    );
    assert.deepEqual(filterPros(renamed, { category: "Medical" }).map((pro) => pro.slug), ["gatbel-chamjock"]);
    assert.deepEqual(filterPros(renamed, { category: "PA" }).map((pro) => pro.slug), ["gatbel-chamjock"]);

    const browser = readFileSync("components/DirectoryBrowser.tsx", "utf8");
    assert.match(browser, /filterPros\(pros, applied\)/);
    assert.match(browser, /field === "category" \|\| field === "type"/);
    assert.match(browser, /TEXT_DEBOUNCE_MS/);
    assert.match(browser, /history\.replaceState/);
    assert.match(browser, /onSearch/);
  });

  it("matches a partial name or business name without regard to case", () => {
    const shop = withName(featuredPros[0], "ada-books", "Ada Okoth", "Bright Books");
    const people = [...featuredPros, shop];
    for (const keyword of ["Tang", "tango", "  Tango Tew "]) {
      assert.deepEqual(filterPros(people, { q: keyword }).map((pro) => pro.slug), ["tango-tew"], keyword);
    }
    assert.deepEqual(filterPros(people, { q: "Gat" }).map((pro) => pro.slug), ["gatbel-chamjock", "gatluak-thach"]);
    assert.deepEqual(filterPros(people, { q: "bright" }).map((pro) => pro.slug), ["ada-books"]);
    assert.deepEqual(filterPros(people, { q: "okoth" }).map((pro) => pro.slug), ["ada-books"]);
    assert.deepEqual(filterPros(people, { q: "nomatch" }), []);
  });

  it("lists Lam Tax Service in St. Cloud and finds the firm by place or service", () => {
    const lam = featuredPros.find((pro) => pro.slug === "lam-tax-service");
    assert.equal(lam?.placeholder, false);
    assert.equal(lam?.name, "Lam Tax Service, LLC");
    assert.equal(lam?.line, "Tax preparation, bookkeeping and payroll in St. Cloud, MN");
    assert.equal(lam?.founder, "Lam Chuol, founder (est. 2016)");
    assert.equal(lam?.location, "22 Wilson Ave NE, Suite 201, St. Cloud, MN 56304");
    assert.equal(lam?.serviceAreas, "St. Cloud, Minnesota (in person)");
    assert.equal(lam?.website, "https://lamtaxservice.com");
    assert.equal(lam?.email, "info@lamtaxservice.com");
    assert.equal(lam?.whatsapp, null);
    assert.deepEqual(lam?.serviceTypes, ["Business"]);
    assert.match(lam?.bio ?? "", /founded in 2016 by Lam Chuol/);
    assert.match(lam?.image.src ?? "", /lam-portrait\.webp$/);
    assert.equal(lam?.image.width, 523);
    assert.equal(lam?.image.height, 630);
    assert.equal(lam?.remote, false);
    assert.equal(lam?.offersRemote, true);
    assert.equal("phone" in (lam ?? {}), false);
    assert.equal(featuredPros.some((pro) => pro.placeholder && pro.category === "tax"), false);
    for (const location of ["St. Cloud", "Saint Cloud", "MN", "Minnesota", "56304"]) {
      assert.deepEqual(
        filterPros(featuredPros, { category: "tax", location }).map((pro) => pro.slug),
        ["lam-tax-service"],
        location,
      );
    }
    for (const keyword of ["bookkeeping", "payroll", "QuickBooks"]) {
      assert.deepEqual(
        filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug),
        ["lam-tax-service"],
        keyword,
      );
    }
    assert.ok(filterPros(featuredPros, { q: "tax" }).some((pro) => pro.slug === "lam-tax-service"));
    for (const keyword of ["filing", "filling", "Minnesota", "MN", "remote", "remote services"]) {
      assert.deepEqual(
        filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug),
        ["lam-tax-service"],
        keyword,
      );
    }
    assert.equal(filterPros(featuredPros, { q: "cloud" }).some((pro) => pro.slug === "lam-tax-service"), false);
    assert.doesNotMatch(`${lam?.bio} ${lam?.location} ${lam?.line} ${lam?.keywords}`, /tel:/);
    const tile = readFileSync("components/ProTile.tsx", "utf8");
    const profile = readFileSync("components/ProView.tsx", "utf8");
    assert.match(tile, /Remote services available/);
    assert.match(profile, /Remote services available/);
  });

  it("lists Dr. Gatluak Ter Thach and finds him by NGO, grant, and Nashville words", () => {
    const gat = featuredPros.find((pro) => pro.slug === "gatluak-thach");
    assert.equal(gat?.placeholder, false);
    assert.equal(gat?.name, "Dr. Gatluak Ter Thach, PhD");
    assert.equal(gat?.line, "NGO Leadership · Finance · Grant Writing Educator");
    assert.equal(gat?.profession, "Educator for NGO leadership and finance");
    assert.equal(gat?.category, "ngo");
    assert.equal(gat?.categoryLabel, "NGO / Social Empowerment");
    assert.deepEqual(gat?.serviceTypes, ["Charity", "Free/Volunteer", "Business"]);
    assert.deepEqual(gat?.credentialBadges, ["PhD"]);
    assert.equal(gat?.businessName, "Nashville International Center for Empowerment (NICE)");
    assert.equal(gat?.location, "417 Welshwood Drive, Ste. 100, Nashville, TN 37211");
    assert.equal(gat?.website, "https://www.empowernashville.org/");
    assert.equal(gat?.email, null);
    assert.equal(gat?.whatsapp, null);
    assert.equal(gat?.remote, false);
    assert.equal(gat?.offersRemote, undefined);
    assert.equal("phone" in (gat ?? {}), false);
    assert.match(gat?.image.src ?? "", /gatluak-thach\.webp$/);
    assert.equal(gat?.image.width, 1080);
    assert.equal(gat?.image.height, 1080);
    assert.equal(gat?.image.position, "center");
    assert.equal(
      gat?.organization?.mission,
      "To ensure refugees and immigrants achieve their full potential now and for generations to come.",
    );
    assert.equal(gat?.organization?.heading, "About NICE / Empower Nashville");
    assert.deepEqual(
      gat?.organization?.groups.map((group) => group.name),
      ["Social Services", "Adult Education", "Youth Education", "Employment", "Immigration", "Health", "Community"],
    );
    const programNames = gat?.organization?.groups.flatMap((group) => group.items.map((item) => item.name)) ?? [];
    for (const name of [
      "Gallatin office",
      "Refugee Family Mentorship",
      "Digital literacy",
      "Bilingual banking",
      "NICE Voices",
    ]) {
      assert.ok(programNames.includes(name), name);
    }
    assert.equal(programNames.some((name) => /driver/i.test(name)), false);
    assert.deepEqual(
      gat?.services.map((service) => service.group),
      ["Free", "Free", "Free", "Free", "Mentorship", "Paid", "Paid"],
    );
    assert.deepEqual(profileLinks(gat!), [{ href: "https://www.empowernashville.org/", label: "Website", globe: true }]);
    assert.deepEqual(
      categoryOptions(featuredPros).find((option) => option.value === "ngo"),
      { value: "ngo", label: "NGO / Social Empowerment" },
    );
    const published = JSON.stringify(gat);
    assert.doesNotMatch(published, /harvard|adjunct|tel:|315[\s.\-]*9681|207[\s.\-]*1686|Duang|Selena|Nyakuma/i);
    assert.match(published, /White House Champion of Change for World Refugees/);
    assert.match(published, /Tennessee State University/);
    assert.match(published, /Cumberland University/);
    assert.match(published, /Argosy University/);
    assert.doesNotMatch(published, /founded in 2003/i);
    for (const keyword of [
      "nonprofit",
      "grant",
      "grant writing",
      "grant proposal",
      "leadership",
      "strategic planning",
      "budgeting",
      "finance",
      "mentorship",
      "refugee",
      "immigrant",
      "Nashville",
      "Tennessee",
      "TN",
      "NICE",
      "Empower Nashville",
      "Gatluak",
      "Thach",
    ]) {
      assert.deepEqual(filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug), ["gatluak-thach"], keyword);
    }
    for (const keyword of ["NGO", "PhD"]) {
      assert.ok(filterPros(featuredPros, { q: keyword }).some((pro) => pro.slug === "gatluak-thach"), keyword);
    }
    for (const location of ["Nashville", "Tennessee", "TN", "Gallatin", "37211"]) {
      assert.deepEqual(
        filterPros(featuredPros, { category: "ngo", location }).map((pro) => pro.slug),
        ["gatluak-thach"],
        location,
      );
    }
    assert.equal(filterPros(featuredPros, { category: "ngo", location: "Omaha" }).length, 0);
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
    assert.deepEqual(people.map((pro) => `/pros/${pro.slug}`), [
      "/pros/tango-tew",
      "/pros/gatbel-chamjock",
      "/pros/lam-tax-service",
      "/pros/gatluak-thach",
    ]);
    assert.equal(people.some((pro) => pro.placeholder), false);

    const page = readFileSync("app/page.tsx", "utf8");
    const tile = readFileSync("components/ProTile.tsx", "utf8");
    assert.match(page, /<ProTile/);
    assert.match(page, /homepageProfessionals/);
    assert.doesNotMatch(page, /ServiceSlideshow|serviceOffers/);
    assert.match(page, /HOME_QUOTE/);
    assert.match(tile, /href=\{`\/pros\/\$\{pro\.slug\}`\}/);
    assert.equal(HOME_QUOTE, "Umuntu ngumuntu ngabantu.");
    assert.equal(HOME_QUOTE_OPEN, "\u201C");
    assert.equal(HOME_QUOTE_CLOSE, "\u201D");
    assert.equal(`${HOME_QUOTE_OPEN}${HOME_QUOTE}${HOME_QUOTE_CLOSE}`, "\u201CUmuntu ngumuntu ngabantu.\u201D");
    const filters = readFileSync("components/HeroSearch.tsx", "utf8");
    assert.match(filters, /aria-label="All categories"/);
    assert.match(filters, /aria-label="All service types"/);
    assert.match(filters, />All service types</);
    assert.equal(HOME_QUOTE_GLOSS, "(A person is a person through other people.)");
    assert.equal(HOME_QUOTE_ATTRIBUTION, "Zulu proverb, the heart of the Ubuntu philosophy.");
    assert.match(HOME_PURPOSE, /Naath sons and daughters/);
  });
});
