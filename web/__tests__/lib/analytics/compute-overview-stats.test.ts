import { describe, expect, it } from "vitest";
import { computeOverviewStats } from "@/lib/analytics/site-analytics";
import { sampleEvents } from "../../helpers/test-fixtures";

describe("computeOverviewStats", () => {
  it("computes totals and unique counts from events", () => {
    expect(computeOverviewStats(sampleEvents)).toEqual({
      totalCrawls: 4,
      uniquePlatforms: 3,
      uniquePages: 3,
      uniqueBots: 3,
      lastSeenAt: "2026-06-15T14:00:00.000Z",
    });
  });
});
