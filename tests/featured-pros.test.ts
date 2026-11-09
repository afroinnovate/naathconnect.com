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
    assert.equal(gatbel?.placeholder, true);
    assert.equal(gatbel?.email, null);
    assert.equal(gatbel?.phoneTel, null);
    assert.equal(featuredPros.filter((pro) => !pro.placeholder).length, 1);
  });

  it("filters by category, keyword, and location", () => {
    assert.deepEqual(
      filterPros(featuredPros, { category: "tax" }).map((pro) => pro.slug),
      [],
    );
    for (const keyword of ["AI", "cloud", "website", "software", "Tango"]) {
      assert.deepEqual(
        filterPros(featuredPros, { q: keyword }).map((pro) => pro.slug),
        ["tango-tew"],
        keyword,
      );
    }
    for (const location of ["Nebraska", "Omaha", "Texas", "iowa"]) {
      assert.deepEqual(
        filterPros(featuredPros, { category: "tech", location }).map((pro) => pro.slug),
        ["tango-tew"],
        location,
      );
    }
    assert.equal(
      featuredPros.some((pro) => /lam tax/i.test(pro.name)),
      false,
    );
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
