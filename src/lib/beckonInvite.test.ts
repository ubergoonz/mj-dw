import { describe, expect, it } from "vitest";
import {
  buildGoogleMapsUrl,
  calculateTotalHours,
  createInitialBeckonInviteForm,
  formatBeckonInviteForChat,
  isFanRangeValid,
} from "./beckonInvite";

describe("calculateTotalHours", () => {
  it("returns null when either datetime is missing", () => {
    expect(calculateTotalHours("", "2026-01-01T20:00")).toBeNull();
    expect(calculateTotalHours("2026-01-01T14:00", "")).toBeNull();
  });

  it("returns null when end is not after start", () => {
    expect(calculateTotalHours("2026-01-01T20:00", "2026-01-01T14:00")).toBeNull();
    expect(calculateTotalHours("2026-01-01T14:00", "2026-01-01T14:00")).toBeNull();
  });

  it("computes the rounded hour difference", () => {
    expect(calculateTotalHours("2026-01-01T14:00", "2026-01-01T20:00")).toBe(6);
    expect(calculateTotalHours("2026-01-01T14:00", "2026-01-01T14:45")).toBe(0.8);
  });
});

describe("buildGoogleMapsUrl", () => {
  it("returns empty string for blank venue query", () => {
    expect(buildGoogleMapsUrl("")).toBe("");
    expect(buildGoogleMapsUrl("   ")).toBe("");
  });

  it("builds a maps search url with the trimmed, encoded query", () => {
    expect(buildGoogleMapsUrl(" 123 Main St ")).toBe(
      "https://www.google.com/maps/search/?api=1&query=123%20Main%20St",
    );
  });
});

describe("isFanRangeValid", () => {
  it("requires max to be greater than min", () => {
    expect(isFanRangeValid(1, 8)).toBe(true);
    expect(isFanRangeValid(5, 5)).toBe(false);
    expect(isFanRangeValid(5, 3)).toBe(false);
  });
});

describe("formatBeckonInviteForChat", () => {
  it("includes core event and rule details", () => {
    const form = createInitialBeckonInviteForm();
    form.venueQuery = "Jurong Point";
    form.startDateTime = "2026-01-01T14:00";
    form.endDateTime = "2026-01-01T20:00";

    const text = formatBeckonInviteForChat(form);

    expect(text).toContain("Jurong Point");
    expect(text).toContain("Total hours: 6h");
    expect(text).toContain("Stake: 0.10 / 0.20");
    expect(text).toContain("Fan range: 1–8");
  });
});
