import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { demoAdminPassword, demoProfessionalPassword } from "../lib/config";
import { openSqliteStore } from "../lib/sqlite-store";

describe("approvals, views, and reactions", () => {
  it("counts one view per viewer per day and ignores the organizer", async () => {
    const store = openSqliteStore(":memory:");
    const events = await store.listApprovedEvents(null);
    const eventId = events[0].id;
    const organizer = await store.authenticate("placeholder-pro-one@example.invalid", demoProfessionalPassword());
    assert.equal(organizer.ok, true);
    if (!organizer.ok) return;
    const authorView = await store.recordView(eventId, "b".repeat(32), organizer.data.id, "2026-11-09");
    assert.equal(authorView.counted, false);
    const first = await store.recordView(eventId, "a".repeat(32), null, "2026-11-09");
    const repeat = await store.recordView(eventId, "a".repeat(32), null, "2026-11-09");
    const nextDay = await store.recordView(eventId, "a".repeat(32), null, "2026-11-10");
    assert.equal(first.counted, true);
    assert.equal(repeat.counted, false);
    assert.equal(repeat.viewCount, 1);
    assert.equal(nextDay.viewCount, 2);
  });

  it("lets an approved account react once, and blocks pending accounts and self-approval", async () => {
    const store = openSqliteStore(":memory:");
    const events = await store.listApprovedEvents(null);
    const eventId = events[0].id;
    const proTwo = await store.authenticate("placeholder-pro-two@example.invalid", demoProfessionalPassword());
    const applicant = await store.authenticate("placeholder-applicant@example.invalid", demoProfessionalPassword());
    const admin = await store.authenticate("placeholder-admin@example.invalid", demoAdminPassword());
    assert.equal(proTwo.ok && applicant.ok && admin.ok, true);
    if (!proTwo.ok || !applicant.ok || !admin.ok) return;

    const pendingEvent = await store.createEvent({
      professionalId: applicant.data.id,
      title: "Should fail",
      summary: "Pending accounts cannot post this.",
      body: "This body is long enough to pass validation.",
      startsAt: "2026-12-01T18:00:00.000Z",
      locationLabel: "Placeholder venue",
    });
    assert.equal(pendingEvent.ok, false);

    const notAdmin = await store.setProfessionalStatus(proTwo.data.id, applicant.data.id, "approved", "no");
    assert.equal(notAdmin.ok, false);

    const blocked = await store.toggleReaction(eventId, applicant.data.id, "like");
    assert.equal(blocked.ok, false);
    const like = await store.toggleReaction(eventId, proTwo.data.id, "like");
    const again = await store.toggleReaction(eventId, proTwo.data.id, "like");
    assert.equal(like.ok && again.ok, true);
    if (!like.ok || !again.ok) return;
    assert.equal(like.data.likeCount, 1);
    assert.equal(like.data.viewerHasLike, true);
    assert.equal(again.data.likeCount, 0);

    const featuredTooSoon = await store.updateConsultation(admin.data.id, applicant.data.id, {
      category: "medical",
      categoryLabel: "Medical consultation",
      featured: true,
      headline: "",
      specialty: "",
      credentials: "",
      contactNote: "",
      gallery: [],
    });
    assert.equal(featuredTooSoon.ok, false);

    const featured = await store.updateConsultation(admin.data.id, proTwo.data.id, {
      category: "legal-aid",
      categoryLabel: "Legal aid",
      featured: true,
      headline: "Placeholder headline",
      specialty: "Placeholder specialty",
      credentials: "Placeholder credentials",
      contactNote: "Placeholder contact",
      gallery: [{ src: "/images/gatbel/portrait.svg", alt: "Placeholder portrait", caption: "Placeholder portrait" }],
    });
    assert.equal(featured.ok, true);
    const consultations = await store.listFeaturedConsultations();
    assert.equal(consultations.some((profile) => profile.category === "legal-aid"), true);
    assert.equal(consultations.some((profile) => profile.name === "Placeholder Applicant"), false);
  });
});
