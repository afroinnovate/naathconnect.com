import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { isAmplifyHosting, isDemoMode } from "../lib/config";

const keys = ["AWS_APP_ID", "AWS_BRANCH", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

describe("Amplify does not fall through to SQLite", () => {
  it("treats an Amplify build as hosted even when Supabase vars are empty", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    process.env.AWS_APP_ID = "amplify-app";
    process.env.AWS_BRANCH = "cursor/site-diagnosis-revamp-bb61";
    assert.equal(isAmplifyHosting(), true);
    assert.equal(isDemoMode(), false);
  });

  it("keeps local demo mode when those vars are absent and Amplify is not set", () => {
    delete process.env.AWS_APP_ID;
    delete process.env.AWS_BRANCH;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    assert.equal(isAmplifyHosting(), false);
    assert.equal(isDemoMode(), true);
  });
});
