import { describe, expect, it } from "vitest";
import { computePeriodActivity } from "@/lib/analytics/site-analytics";
import { makeCrawlerEvent } from "../../helpers/test-fixtures";

describe("computePeriodActivity", () => {
  it("counts events into overlapping 24h, 7d, and 30d windows", () => {
    const now = new Date("2026-06-17T12:00:00.000Z");
    const result = computePeriodActivity(
      [
        makeCrawlerEvent({ timestamp: "2026-06-17T06:00:00.000Z" }), // 6h
        makeCrawlerEvent({ timestamp: "2026-06-15T12:00:00.000Z" }), // 2d
        makeCrawlerEvent({ timestamp: "2026-06-01T12:00:00.000Z" }), // 16d
        makeCrawlerEvent({ timestamp: "2026-05-01T12:00:00.000Z" }), // 47d
      ],
      { now },
    );

    expect(result).toEqual([
      { period: "24h", crawlCount: 1 },
      { period: "7d", crawlCount: 2 },
      { period: "30d", crawlCount: 3 },
    ]);
  });
});
