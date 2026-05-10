import { describe, expect, it } from "vitest";
import { JobsListQuery } from "@smartjob/shared";

describe("JobsListQuery validation", () => {
  it("coerces salaryMin/salaryMax from strings", () => {
    const parsed = JobsListQuery.parse({ salaryMin: "500000", salaryMax: "1500000" });
    expect(parsed.salaryMin).toBe(500_000);
    expect(parsed.salaryMax).toBe(1_500_000);
  });

  it("coerces remote=true correctly", () => {
    const parsed = JobsListQuery.parse({ remote: "true" });
    expect(parsed.remote).toBe(true);
  });

  it("rejects negative salaries", () => {
    expect(() => JobsListQuery.parse({ salaryMin: "-1" })).toThrow();
  });

  it("defaults page and pageSize", () => {
    const parsed = JobsListQuery.parse({});
    expect(parsed.page).toBe(1);
    expect(parsed.pageSize).toBe(20);
  });
});
