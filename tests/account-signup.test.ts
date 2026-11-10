import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { authCallbackUrl, googleAuthEnabled } from "../lib/config";
import { openSqliteStore } from "../lib/sqlite-store";

const saved = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED;

afterEach(() => {
  if (saved === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED;
  else process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED = saved;
});

describe("account sign-up", () => {
  it("hides Google until the env flag is exactly true", () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED;
    assert.equal(googleAuthEnabled(), false);
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED = "yes";
    assert.equal(googleAuthEnabled(), false);
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED = " true ";
    assert.equal(googleAuthEnabled(), true);
  });

  it("sends email confirmation to the site callback", () => {
    const previous = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://naathconnect.com";
    assert.equal(authCallbackUrl(), "https://naathconnect.com/auth/callback");
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  });

  it("creates a pending member and does not approve them", () => {
    const store = openSqliteStore(":memory:");
    const created = store.createAccount("new-member@example.invalid", "long-password");
    assert.equal(created instanceof Promise, false);
    if (created instanceof Promise) return;
    assert.equal(created.ok, true);
    if (!created.ok) return;
    const profile = store.getProfile(created.data.userId);
    if (profile instanceof Promise) return;
    assert.equal(profile?.status, "pending");
    assert.equal(profile?.role, "member");
    assert.notEqual(profile?.status, "approved");
  });

  it("keeps the onboarding promise about admin approval", () => {
    const form = readFileSync("components/OnboardingForm.tsx", "utf8");
    assert.match(form, /this application stays pending until an admin approves it/);
    assert.doesNotMatch(form, /preview is not the live site/);
  });
});
