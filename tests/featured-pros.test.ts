import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { featuredPros, filterPros, getFeaturedPro } from "../lib/featured-pros";
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
    assert.equal(tango?.serviceAreas, null);
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
      ["taxation"],
    );
    assert.deepEqual(
      filterPros(featuredPros, { q: "software" }).map((pro) => pro.slug),
      ["tango-tew"],
    );
    assert.deepEqual(
      filterPros(featuredPros, { location: "iowa", category: "tech" }).map((pro) => pro.slug),
      [],
    );
    assert.equal(
      featuredPros.some((pro) => /lam tax/i.test(pro.name)),
      false,
    );
  });
});
