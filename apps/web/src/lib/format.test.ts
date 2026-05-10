import { describe, expect, it } from "vitest";
import { formatRelative, formatZar, formatZarRange } from "./format";

describe("formatZar", () => {
  it("returns dash for null/undefined", () => {
    expect(formatZar(null)).toBe("—");
    expect(formatZar(undefined)).toBe("—");
  });

  it("formats with R prefix", () => {
    expect(formatZar(950_000)).toContain("950");
    expect(formatZar(950_000)).toContain("R");
  });
});

describe("formatZarRange", () => {
  it("returns dash when both null", () => {
    expect(formatZarRange(null, null)).toBe("—");
  });

  it("formats a full range", () => {
    expect(formatZarRange(500_000, 800_000)).toContain("500");
    expect(formatZarRange(500_000, 800_000)).toContain("800");
  });

  it("uses + suffix for min only", () => {
    expect(formatZarRange(500_000, null)).toMatch(/\+$/);
  });

  it("uses 'Up to' for max only", () => {
    expect(formatZarRange(null, 800_000)).toMatch(/^Up to/);
  });
});

describe("formatRelative", () => {
  it("formats a past date", () => {
    const past = new Date(Date.now() - 1000 * 60 * 60 * 2);
    const out = formatRelative(past);
    expect(out).toMatch(/hour|hours|now/);
  });
});
