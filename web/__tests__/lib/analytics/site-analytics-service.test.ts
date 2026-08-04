import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSiteAnalytics } from "@/lib/analytics/site-analytics";
import { createMockSupabase } from "../../helpers/mock-supabase";
import { sampleEvents } from "../../helpers/test-fixtures";

describe("site analytics services", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.UTC(2026, 5, 17)));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("getSiteAnalytics fetches once and returns all aggregations", async () => {
    const { client, from, builders } = createMockSupabase({
      fromResults: {
        crawler_events: { data: sampleEvents, error: null },
      },
    });

    const analytics = await getSiteAnalytics(client, "site-1");

    expect(from).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith("crawler_events");
    expect(builders.get("crawler_events")?.eq).toHaveBeenCalledWith(
      "site_id",
      "site-1",
    );
    expect(builders.get("crawler_events")?.order).toHaveBeenCalledWith(
      "received_at",
      { ascending: false },
    );
    expect(analytics.overview.totalCrawls).toBe(4);
    expect(analytics.platforms).toHaveLength(3);
    expect(analytics.topPages).toHaveLength(3);
    expect(analytics.activityLog).toHaveLength(4);
    expect(analytics.periodActivity).toEqual([
      { period: "24h", crawlCount: 0 },
      { period: "7d", crawlCount: 3 },
      { period: "30d", crawlCount: 4 },
    ]);
    expect(analytics.activityTrend).toHaveLength(12);
    expect(analytics.activityTrendDelta).toEqual({
      direction: "up",
      percent: null,
    });
  });

  it("throws when fetching crawler events fails", async () => {
    const { client } = createMockSupabase({
      fromResults: {
        crawler_events: {
          data: null,
          error: { message: "timeout" },
        },
      },
    });

    await expect(getSiteAnalytics(client, "site-1")).rejects.toThrow(
      "Failed to load crawler events: timeout",
    );
  });

  it("treats null event data as an empty list", async () => {
    const { client } = createMockSupabase({
      fromResults: {
        crawler_events: { data: null, error: null },
      },
    });

    const analytics = await getSiteAnalytics(client, "site-1");

    expect(analytics.overview.totalCrawls).toBe(0);
    expect(analytics.platforms).toEqual([]);
    expect(analytics.topPages).toEqual([]);
    expect(analytics.activityLog).toEqual([]);
    expect(analytics.periodActivity).toEqual([]);
    expect(analytics.activityTrend).toEqual([]);
    expect(analytics.activityTrendDelta).toBeNull();
  });
});
