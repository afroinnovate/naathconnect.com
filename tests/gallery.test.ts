import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseGalleryLines, sanitizeGallery } from "../lib/gallery";

describe("gallery paths", () => {
  it("accepts files under /images and rejects remote or script URLs", () => {
    const parsed = parseGalleryLines(
      [
        "/images/gatbel/gown.jpg | Medical gown | Placeholder gown photo",
        "https://example.com/photo.jpg | Remote | No",
        "javascript:alert(1) | Script | No",
      ].join("\n"),
    );
    assert.equal(parsed.images.length, 1);
    assert.equal(parsed.rejected, 2);
    assert.equal(sanitizeGallery([{ src: "/images/gatbel/portrait.svg", alt: "Portrait", caption: "Placeholder" }]).length, 1);
  });
});
