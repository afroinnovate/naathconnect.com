import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const NUMBER = /405[\s.\-]*519[\s.\-]*6057|\+14055196057|tel:/;
const YAT_PHONE = "tel:+14029372554";

function stripWhatsapp(value: string): string {
  return value.replace(/https:\/\/wa\.me\/14055196057/g, "");
}

/** Yat Auto Repair is the only listing allowed to publish a phone number. */
function stripShopPhone(value: string): string {
  return stripWhatsapp(value).replaceAll(YAT_PHONE, "");
}

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...sourceFiles(full));
    else if (/\.(tsx|ts)$/.test(entry)) found.push(full);
  }
  return found;
}

describe("phone numbers stay off the page", () => {
  it("does not put the phone number in the footer, contact page, profile, or service page", () => {
    const pages = [
      "components/Footer.tsx",
      "app/contact/page.tsx",
      "components/ProView.tsx",
      "app/services/[slug]/page.tsx",
      "app/page.tsx",
    ];
    for (const file of pages) {
      const text = stripShopPhone(readFileSync(file, "utf8"));
      assert.doesNotMatch(text, NUMBER, file);
      assert.doesNotMatch(text, /SITE_PHONE/);
      assert.doesNotMatch(text, /402[\s.\-)]*937[\s.\-]*2554|\+14029372554/);
    }
    const footer = readFileSync("components/Footer.tsx", "utf8");
    assert.match(footer, /WhatsApp/);
    assert.match(footer, /mailto:\$\{SITE_EMAIL\}/);
    assert.match(footer, /SITE_WHATSAPP/);
  });

  it("keeps the digits only inside the WhatsApp URL in app and component source", () => {
    const files = [...sourceFiles("app"), ...sourceFiles("components"), ...sourceFiles("lib")];
    const phoneFiles = files.filter((file) => readFileSync(file, "utf8").includes(YAT_PHONE));
    assert.deepEqual(phoneFiles, ["lib/featured-pros.ts"]);
    for (const file of files) {
      const text = stripShopPhone(readFileSync(file, "utf8"));
      assert.doesNotMatch(text, NUMBER, file);
    }
  });
});
