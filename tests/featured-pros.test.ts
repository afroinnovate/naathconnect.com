import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { featuredPros, filterPros, getFeaturedPro, mergeDirectory, type PublicPro } from "../lib/featured-pros";
import { RESUME_URL } from "../lib/site";

describe("featured professionals", () => {
  it("marks only Tango as a real listing", () => {
    const tango = getFeaturedPro("tango-tew");
    assert.equal(tango?.placeholder, false);
    assert.equal(tango?.years, "7 years of tech consulting");
    assert.match(tango?.school ?? "", /Southern Methodist University/);
    assert.match(tango?.school ?? "", /Dallas, TX/);
    assert.match(tango?.school ?? "", /Dire Dawa University, Ethiopia/);
    assert.equal(tango?.location, null);
    assert.equal(tango?.remote, true);
    assert.equal(tango?.serviceAreas, "Remote · serving clients everywhere");
    assert.equal(RESUME_URL, "https://bold.pro/my/tango-tew-250503225331");
    assert.equal(tango?.website, RESUME_URL);
    assert.equal(tango?.github, "https://github.com/tew9");
    assert.equal(tango?.linkedin, "https://www.linkedin.com/in/tango-tew-759437163");
    const gatbel = getFeaturedPro("gatbel-chamjock");
    assert.equal(gatbel?.placeholder, false);
    assert.equal(gatbel?.comingSoon, false);
    assert.equal(gatbel?.name, "Dr. Gatbel Nyak Chamjock, DrPH, MPAS, PA-C");
    assert.equal(gatbel?.line, "Doctor · Epidemiologist · Health Educator");
    assert.deepEqual(
      gatbel?.titles?.map((item) => item.title),
      [
        "Doctor of Public Health",
        "Epidemiologist",
        "Health Educator",
        "MPAS",
        "PA-C",
        "Board member and medical team lead",
        "Bachelor's degree in biology",
      ],
    );
    assert.deepEqual(gatbel?.credentialBadges, ["DrPH", "MPAS", "PA-C"]);
    assert.equal(gatbel?.experience?.[0]?.title, "Epidemiologist and health educator");
    assert.equal(gatbel?.titles?.[0]?.title, "Doctor of Public Health");
    assert.match(gatbel?.titles?.[0]?.detail ?? "", /DrPH, Capella University, Minneapolis, Minnesota/);
    assert.match(gatbel?.bio ?? "", /holds a Doctor of Public Health \(DrPH\) from Capella University in Minneapolis, Minnesota/);
    assert.match(gatbel?.titles?.map((item) => item.detail).join(" ") ?? "", /Union College in Lincoln, Nebraska/);
    assert.match(gatbel?.titles?.map((item) => item.detail).join(" ") ?? "", /Tennessee State University/);
    assert.equal(gatbel?.category, "medical");
    assert.match(gatbel?.bio ?? "", /^Dr\. Gatbel Nyak Chamjock is a Doctor of Public Health, an epidemiologist, and a health educator\./);
    assert.match(gatbel?.bio ?? "", /including on social media such as Facebook, in person around Iowa, and remotely through telehealth and online lessons/);
    assert.equal(gatbel?.serviceAreas, "Iowa (in person) · Remote telehealth anywhere");
    assert.equal(gatbel?.remote, true);
    assert.equal(gatbel?.email, "gchamjock@gmail.com");
    assert.equal(gatbel?.whatsapp, "https://wa.me/19705207160");
    assert.equal(gatbel?.website, "https://gambellamed.org/board-members/");
    assert.equal(gatbel?.websiteLabel, "Public profile");
    assert.equal(gatbel?.notice, "Information for general education. For emergencies call 911.");
    assert.match(gatbel?.image.src ?? "", /gatbel-coat\.webp$/);
    assert.doesNotMatch(`${gatbel?.name} ${gatbel?.bio} ${gatbel?.serviceAreas} ${gatbel?.notice}`, /970|tel:|\bMD\b|\bDO\b/);
    assert.equal(getFeaturedPro("tango-tew")?.image.src, "/images/tango/tango-headshot-circle.webp");
    assert.deepEqual(tango?.serviceTypes, ["Business", "Free/Volunteer"]);
    assert.deepEqual(gatbel?.serviceTypes, ["Charity"]);
    assert.equal(gatbel?.businessName, null);
    assert.equal(
      featuredPros.filter((pro) => pro.placeholder || pro.comingSoon).every((pro) => pro.serviceTypes.length === 0),
      true,
    );
    assert.equal(featuredPros.filter((pro) => !pro.placeholder).length, 5);
  });

  it("filters by category, keyword, and location", () => {
    assert.deepEqual(
      filterPros(featuredPros, { category: "tax" }).map((pro) => pro.slug),
      ["lam-tax-service"],
    );
    for (const keyword of ["Tang", "tango", "TANGO"]) {
      assert.deepEqual(
        filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug),
        ["tango-tew"],
        keyword,
      );
    }
    assert.deepEqual(filterPros(featuredPros, { q: "Gat" }).map((pro) => pro.slug), ["gatbel-chamjock", "gatluak-thach"]);
    assert.deepEqual(filterPros(featuredPros, { q: "cloud" }).map((pro) => pro.slug), []);
    for (const location of ["Nebraska", "Omaha", "Texas", "iowa"]) {
      assert.deepEqual(
        filterPros(featuredPros, { category: "tech", location }).map((pro) => pro.slug),
        ["tango-tew"],
        location,
      );
    }
    for (const location of ["Iowa", "Waterloo", "Waterloo, IA", "Des Moines", "Cedar Rapids", "Iowa City", "Dallas, TX"]) {
      const slugs = filterPros(featuredPros, { category: "medical", location }).map((pro) => pro.slug);
      assert.deepEqual(slugs, ["gatbel-chamjock"], location);
    }
    assert.equal(featuredPros.some((pro) => pro.slug === "lam-tax-service" && !pro.placeholder), true);
  });

  it("keeps one card when an approved account repeats a curated professional", () => {
    const duplicate = {
      ...featuredPros[0],
      slug: "account-id",
      dedupeEmail: featuredPros[0].email,
    } satisfies PublicPro;
    const merged = mergeDirectory(featuredPros, [duplicate]);
    assert.equal(merged.filter((pro) => pro.name === "Tango Tew").length, 1);
    assert.equal(merged.some((pro) => pro.slug === "account-id"), false);
  });
});
