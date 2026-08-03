import { describe, expect, it } from "vitest";
import { computeOverviewStats } from "@/lib/analytics/site-analytics";
import { makeCrawlerEvent, sampleEvents } from "../../helpers/test-fixtures";

describe("computeOverviewStats", () => {
  it("returns zeroed stats for an empty event list", () => {
    expect(computeOverviewStats([])).toEqual({
      totalCrawls: 0,
      uniquePlatforms: 0,
      uniquePages: 0,
      uniqueBots: 0,
      lastSeenAt: null,
    });
  });

  it("computes totals and unique counts from events", () => {
    expect(computeOverviewStats(sampleEvents)).toEqual({
      totalCrawls: 4,
      uniquePlatforms: 3,
      uniquePages: 3,
      uniqueBots: 3,
      lastSeenAt: "2026-06-15T14:00:00.000Z",
    });
  });

  it("handles a single event", () => {
    const event = makeCrawlerEvent();
    expect(computeOverviewStats([event])).toEqual({
      totalCrawls: 1,
      uniquePlatforms: 1,
      uniquePages: 1,
      uniqueBots: 1,
      lastSeenAt: event.received_at,
    });
  });

  it("treats null/blank platform and bot as unknown", () => {
    const stats = computeOverviewStats([
      makeCrawlerEvent({ platform: null, bot_name: "  ", page_path: "/a" }),
      makeCrawlerEvent({
        platform: null,
        bot_name: null,
        page_path: "/b",
        received_at: "2026-06-16T00:00:00.000Z",
      }),
    ]);

    expect(stats.uniquePlatforms).toBe(1);
    expect(stats.uniqueBots).toBe(1);
    expect(stats.lastSeenAt).toBe("2026-06-16T00:00:00.000Z");
  });

  it("counts a null page_path and matching pathname as one unique page", () => {
    const stats = computeOverviewStats([
      makeCrawlerEvent({
        page_path: null,
        page_url: "https://example.com/docs/guide",
      }),
      makeCrawlerEvent({
        page_path: "/docs/guide",
        page_url: "https://example.com/docs/guide",
        received_at: "2026-06-16T00:00:00.000Z",
      }),
    ]);

    expect(stats.uniquePages).toBe(1);
  });

  it("uses / when page_path is null and page_url is invalid", () => {
    const stats = computeOverviewStats([
      makeCrawlerEvent({ page_path: null, page_url: "not-a-url" }),
    ]);

    expect(stats.uniquePages).toBe(1);
  });
});
