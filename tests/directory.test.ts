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
    assert.deepEqual(volunteer, ["tango-tew", "gatluak-thach", "nice-empower-nashville"]);
    assert.deepEqual(business, ["tango-tew", "yat-auto-repair", "lam-tax-service", "gatluak-thach"]);
    assert.deepEqual(charity, ["gatbel-chamjock", "nice-empower-nashville"]);

    const unset = withName(featuredPros[2], "lam-tax-demo", "Lam Tax Service", "Lam Tax Service");
    unset.serviceTypes = [];
    const people = [...featuredPros, unset];
    assert.deepEqual(filterPros(people, { type: "Charity" }).map((pro) => pro.slug), ["gatbel-chamjock", "nice-empower-nashville"]);
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
    assert.deepEqual(slugs({ type: "Charity" }), ["gatbel-chamjock", "nice-empower-nashville"]);
    assert.deepEqual(slugs({ type: "business" }), ["tango-tew", "yat-auto-repair", "lam-tax-service", "gatluak-thach"]);
    assert.deepEqual(slugs({ q: "Tang" }), ["tango-tew"]);
    assert.deepEqual(slugs({}), ["tango-tew", "gatbel-chamjock", "yat-auto-repair", "lam-tax-service", "gatluak-thach", "nice-empower-nashville"]);

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

  it("finds Yat Auto Repair by city, state, and street address", () => {
    const yat = featuredPros.find((pro) => pro.slug === "yat-auto-repair");
    assert.equal(yat?.placeholder, false);
    assert.equal(yat?.comingSoon, false);
    assert.equal(yat?.name, "Yat Auto Repair");
    assert.equal(yat?.line, "Auto repair shop");
    assert.equal(yat?.location, "105 5th Ave NE, Le Mars, IA 51031");
    assert.equal(yat?.serviceAreas, "Le Mars, Iowa (in person)");
    assert.equal(yat?.bio, "Full-service auto repair shop in Le Mars, Iowa, handling everything from tires and brakes to engine work.");
    assert.equal(yat?.serviceSummary, "From tires and brakes to engine work.");
    assert.deepEqual(
      yat?.services.map((service) => service.name),
      [
        "Tires",
        "Oil changes and fluids",
        "Brakes",
        "Batteries and electrical",
        "Suspension and steering",
        "Alignment",
        "Exhaust",
        "AC and heating",
        "Diagnostics and check engine light",
        "Transmission",
        "Engine repair",
      ],
    );
    for (const keyword of ["tires", "brakes", "engine"]) {
      assert.deepEqual(
        filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug),
        ["yat-auto-repair"],
        keyword,
      );
    }
    assert.deepEqual(yat?.serviceTypes, ["Business"]);
    assert.equal(yat?.phone?.label, "(402) 937-2554");
    assert.equal(yat?.phone?.href, "tel:+14029372554");
    assert.equal(yat?.email, null);
    assert.equal(yat?.whatsapp, null);
    assert.equal(featuredPros.filter((pro) => pro.phone).map((pro) => pro.slug).join(), "yat-auto-repair");
    assert.match(yat?.image.src ?? "", /auto-shop\.svg$/);
    assert.equal(featuredPros.some((pro) => pro.placeholder && pro.category === "auto"), false);

    for (const location of ["Le Mars", "Le Mars, IA", "Iowa", "51031", "5th Ave"]) {
      assert.deepEqual(
        filterPros(featuredPros, { category: "auto", location }).map((pro) => pro.slug),
        ["yat-auto-repair"],
        location,
      );
    }
    assert.deepEqual(filterPros(featuredPros, { category: "Auto" }).map((pro) => pro.slug), ["yat-auto-repair"]);
    assert.equal(filterPros(featuredPros, { type: "Business" }).some((pro) => pro.slug === "yat-auto-repair"), true);
    assert.equal(filterPros(featuredPros, { type: "Charity" }).some((pro) => pro.slug === "yat-auto-repair"), false);
    assert.ok(homepageProfessionals(featuredPros).some((pro) => pro.slug === "yat-auto-repair"));
    assert.doesNotMatch(`${yat?.bio} ${yat?.location} ${yat?.line}`, /tel:/);
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

  it("lists Dr. Gatluak Ter Thach apart from NICE's programs", () => {
    const gat = featuredPros.find((pro) => pro.slug === "gatluak-thach");
    assert.equal(gat?.name, "Dr. Gatluak Ter Thach, PhD");
    assert.equal(gat?.line, "NGO Leadership · Finance · Grant Writing Educator");
    assert.equal(gat?.profession, "Educator for NGO leadership and finance");
    assert.deepEqual(gat?.serviceTypes, ["Business", "Free/Volunteer"]);
    assert.deepEqual(gat?.credentialBadges, ["PhD"]);
    assert.equal(gat?.businessName, null);
    assert.equal(gat?.location, "Nashville, TN");
    assert.equal(gat?.website, null);
    assert.equal(gat?.email, null);
    assert.equal(gat?.organization, undefined);
    assert.deepEqual(gat?.reference, {
      label: "Affiliation",
      text: "Founder & President/CEO of NICE",
      href: "/pros/nice-empower-nashville",
    });
    assert.deepEqual(
      gat?.services.map((service) => service.group),
      ["Free", "Free", "Free", "Free", "Mentorship", "Paid", "Paid"],
    );
    assert.deepEqual(profileLinks(gat!), []);
    assert.match(gat?.image.src ?? "", /gatluak-thach\.webp$/);
    const published = JSON.stringify(gat);
    assert.doesNotMatch(published, /harvard|adjunct|tel:|315[\s.\-]*9681|207[\s.\-]*1686|Duang|Selena|Nyakuma|Gallatin office|Digital literacy/i);
    assert.match(published, /White House Champion of Change for World Refugees/);
    assert.match(published, /Tennessee State University/);
    assert.match(published, /Cumberland University/);
    assert.match(published, /Argosy University/);
    for (const keyword of [
      "grant",
      "grant writing",
      "grant proposal",
      "NGO leadership",
      "strategic planning",
      "budgeting",
      "finance",
      "Gatluak",
      "Thach",
    ]) {
      assert.deepEqual(filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug), ["gatluak-thach"], keyword);
    }
    assert.deepEqual(filterPros(featuredPros, { q: "mentorship" }).map((pro) => pro.slug), [
      "gatluak-thach",
      "nice-empower-nashville",
    ]);
    assert.ok(filterPros(featuredPros, { q: "PhD" }).some((pro) => pro.slug === "gatluak-thach"));
    assert.deepEqual(filterPros(featuredPros, { q: "Nashville" }).map((pro) => pro.slug), [
      "gatluak-thach",
      "nice-empower-nashville",
    ]);
    assert.deepEqual(filterPros(featuredPros, { q: "TN" }).map((pro) => pro.slug), [
      "gatluak-thach",
      "nice-empower-nashville",
    ]);
  });

  it("lists NICE in its own words and finds the center by its search terms", () => {
    const nice = featuredPros.find((pro) => pro.slug === "nice-empower-nashville");
    assert.equal(nice?.name, "Nashville International Center for Empowerment (NICE)");
    assert.equal(nice?.line, "Everyone deserves a chance to thrive.");
    assert.equal(nice?.category, "ngo");
    assert.equal(nice?.categoryLabel, "NGO / Social Empowerment");
    assert.deepEqual(nice?.serviceTypes, ["Charity", "Free/Volunteer"]);
    assert.equal(nice?.location, "417 Welshwood Drive, Ste. 100, Nashville, TN 37211");
    assert.equal(nice?.website, "https://www.empowernashville.org/");
    assert.equal(nice?.email, null);
    assert.equal(nice?.remote, false);
    assert.equal("phone" in (nice ?? {}), false);
    assert.equal(nice?.image.fit, "contain");
    assert.match(nice?.image.src ?? "", /nice-icon\.webp$/);
    assert.match(nice?.wordmark?.src ?? "", /nice-wordmark\.webp$/);
    assert.equal(
      nice?.mission,
      "To ensure refugees and immigrants achieve their full potential now and for generations to come.",
    );
    assert.deepEqual(nice?.statements, [
      "Since 2005, NICE has helped refugees and immigrants find housing, work, and belonging in Middle Tennessee — because no one should have to build a new life alone.",
      "Nashville International Center for Empowerment (NICE) is a 501(c)(3) nonprofit organization based in South Nashville.",
      "NICE is an affiliate of ECDC.",
      "Formerly known as Sudanese Community & Women's Service Center.",
    ]);
    assert.deepEqual(nice?.records, [{ label: "EIN", value: "02-0674431" }]);
    assert.deepEqual(nice?.reference, {
      label: "Point of contact",
      text: "Dr. Gatluak Ter Thach, PhD, Founder & President/CEO",
      href: "/pros/gatluak-thach",
    });
    assert.equal(nice?.organization?.heading, "Programs");
    assert.deepEqual(
      nice?.organization?.groups.map((group) => group.name),
      ["Social Services", "Adult Education", "Youth Education", "Employment", "Immigration", "Health", "Community"],
    );
    const programNames = nice?.organization?.groups.flatMap((group) => group.items.map((item) => item.name)) ?? [];
    for (const name of ["Gallatin office", "Refugee Family Mentorship", "Digital literacy", "Bilingual banking", "NICE Voices"]) {
      assert.ok(programNames.includes(name), name);
    }
    assert.equal(programNames.some((name) => /driver/i.test(name)), false);
    assert.deepEqual(profileLinks(nice!), [{ href: "https://www.empowernashville.org/", label: "Website", globe: true }]);
    assert.deepEqual(categoryOptions(featuredPros).find((option) => option.value === "ngo"), {
      value: "ngo",
      label: "NGO / Social Empowerment",
    });
    const published = JSON.stringify(nice);
    assert.doesNotMatch(published, /tel:|315[\s.\-]*9681|207[\s.\-]*1686|culturally sensitive|It was established in 2005/i);
    for (const keyword of ["NICE", "Empower Nashville", "refugee", "immigrant", "nonprofit", "Tennessee", "ESL", "employment", "immigration", "youth"]) {
      assert.deepEqual(filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug), ["nice-empower-nashville"], keyword);
    }
    assert.ok(filterPros(featuredPros, { q: "NGO" }).some((pro) => pro.slug === "nice-empower-nashville"));
    for (const location of ["Nashville", "Tennessee", "TN", "Gallatin", "37211"]) {
      assert.ok(
        filterPros(featuredPros, { category: "ngo", location }).some((pro) => pro.slug === "nice-empower-nashville"),
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
      "/pros/yat-auto-repair",
      "/pros/lam-tax-service",
      "/pros/gatluak-thach",
      "/pros/nice-empower-nashville",
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
