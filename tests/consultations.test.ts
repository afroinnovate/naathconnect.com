import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { groupConsultations, houseConsultations, mergeConsultations, profileToConsultation } from "../lib/consultations";
import type { Profile } from "../lib/types";

describe("consultation sections", () => {
  it("publishes Gatbel as a physician assistant and keeps Tango as the technology feature", () => {
    const house = houseConsultations();
    const gatbel = house.find((profile) => profile.slug === "gatbel-chamjock");
    const tango = house.find((profile) => profile.slug === "tango-tew");
    assert.equal(gatbel?.placeholder, false);
    assert.equal(gatbel?.name, "Dr. Gatbel Nyak Chamjock, DrPH, MPAS, PA-C");
    assert.match(gatbel?.summary ?? "", /^Dr\. Gatbel is a board-certified/);
    assert.match(gatbel?.portrait?.src ?? "", /gatbel-coat\.webp$/);
    assert.doesNotMatch(gatbel?.name ?? "", /ChamJock|\bMD\b|\bDO\b/);
    assert.equal(gatbel?.specialty, "Emergency medicine");
    assert.equal(tango?.layout, "feature");
    assert.match(tango?.portrait?.src ?? "", /tango-tech-consultation/);
    const groups = groupConsultations(house);
    assert.deepEqual(
      groups.map((group) => group.category),
      ["technology", "medical"],
    );
  });

  it("appends a featured directory professional in a new category", () => {
    const directory = profileToConsultation({
      id: "pro-1",
      email: "placeholder-pro-one@example.invalid",
      fullName: "Placeholder Professional One",
      businessName: "Placeholder Community Workshop",
      profession: "Workshops",
      serviceArea: "Placeholder region",
      bio: "PLACEHOLDER profile.",
      website: null,
      publicContact: null,
      status: "approved",
      role: "professional",
      reviewNote: null,
      createdAt: "2026-11-01T00:00:00.000Z",
      reviewedAt: null,
      consultationCategory: "workshops",
      consultationCategoryLabel: "Community workshops",
      consultationHeadline: "Placeholder workshop hour",
      specialty: null,
      credentials: null,
      contactNote: null,
      gallery: [],
      featuredConsultation: true,
      serviceTypes: [],
    } satisfies Profile);
    const groups = groupConsultations(mergeConsultations(houseConsultations(), [directory]));
    assert.equal(groups.at(-1)?.category, "workshops");
    assert.equal(groups.at(-1)?.profiles[0].placeholder, true);
  });
});
