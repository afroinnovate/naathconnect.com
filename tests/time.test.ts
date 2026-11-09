import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { zonedLocalToUtc } from "../lib/time";

describe("event times", () => {
  it("converts Central standard time", () => {
    assert.equal(zonedLocalToUtc("2026-11-18T17:30", "America/Chicago").toISOString(), "2026-11-18T23:30:00.000Z");
  });

  it("converts Central daylight time", () => {
    assert.equal(zonedLocalToUtc("2026-07-15T12:00", "America/Chicago").toISOString(), "2026-07-15T17:00:00.000Z");
  });
});
