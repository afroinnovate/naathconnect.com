import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { allowIndexing, canonicalRedirectUrl, isDemoMode, robotsTag, siteUrl } from "../lib/config";

const keys = [
  "ALLOW_INDEXING",
  "NEXT_PUBLIC_SITE_URL",
  "AWS_APP_ID",
  "AWS_BRANCH",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;
const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe("indexing stays off until ALLOW_INDEXING=true", () => {
  it("disallows indexing when the flag is unset", () => {
    delete process.env.ALLOW_INDEXING;
    assert.equal(allowIndexing(), false);
    assert.equal(robotsTag(), "noindex, nofollow");
  });

  it("disallows indexing for any value other than true", () => {
    for (const value of ["", "false", "1", "yes", "trueish"]) {
      process.env.ALLOW_INDEXING = value;
      assert.equal(allowIndexing(), false, value);
    }
    process.env.ALLOW_INDEXING = " true ";
    assert.equal(allowIndexing(), true);
    assert.equal(robotsTag(), null);
  });
});

describe("site URL", () => {
  it("uses NEXT_PUBLIC_SITE_URL when it is an http(s) origin", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://naathconnect.com/";
    process.env.AWS_BRANCH = "main";
    assert.equal(siteUrl(), "https://naathconnect.com");
  });

  it("defaults the Amplify main branch to the apex", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    process.env.AWS_BRANCH = "main";
    assert.equal(siteUrl(), "https://naathconnect.com");
    assert.equal(isDemoMode(), false);
  });

  it("does not claim the live host from a laptop", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.AWS_BRANCH;
    delete process.env.AWS_APP_ID;
    assert.equal(siteUrl(), "http://localhost:3000");
  });

  it("sends www to the apex and leaves other hosts alone", () => {
    assert.equal(
      canonicalRedirectUrl("www.naathconnect.com", "/pros/tango-tew", "?q=tax"),
      "https://naathconnect.com/pros/tango-tew?q=tax",
    );
    assert.equal(canonicalRedirectUrl("WWW.naathconnect.com:443", "/", ""), "https://naathconnect.com/");
    assert.equal(canonicalRedirectUrl("naathconnect.com", "/", ""), null);
    assert.equal(canonicalRedirectUrl("localhost:3000", "/", ""), null);
  });
});
