import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getOverviewStats,
  getPlatformBreakdown,
  getSiteAnalytics,
  getTopPages,
} from "@/lib/analytics/site-analytics";
import { createMockSupabase } from "../../helpers/mock-supabase";
import { sampleEvents } from "../../helpers/test-fixtures";

describe("site analytics services", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 17));
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  it("getOverviewStats fetches events and computes overview", async () => {
    const { client, from, builders } = createMockSupabase({
      fromResults: {
        crawler_events: { data: sampleEvents, error: null },
      },
    });

    const stats = await getOverviewStats(client, "site-1");

    expect(from).toHaveBeenCalledWith("crawler_events");
    expect(builders.get("crawler_events")?.eq).toHaveBeenCalledWith(
      "site_id",
      "site-1",
    );
    expect(builders.get("crawler_events")?.order).toHaveBeenCalledWith(
      "received_at",
      { ascending: false },
    );
    expect(stats.totalCrawls).toBe(4);
    expect(stats.uniqueBots).toBe(3);
  });

  it("getPlatformBreakdown returns aggregated platforms", async () => {
    const { client } = createMockSupabase({
      fromResults: {
        crawler_events: { data: sampleEvents, error: null },
      },
    });

    const platforms = await getPlatformBreakdown(client, "site-1");

    expect(platforms[0]).toMatchObject({
      botName: "GPTBot",
      crawlCount: 2,
    });
  });

  it("getTopPages returns aggregated pages", async () => {
    const { client } = createMockSupabase({
      fromResults: {
        crawler_events: { data: sampleEvents, error: null },
      },
    });

    const pages = await getTopPages(client, "site-1");

    expect(pages[0]).toMatchObject({
      pagePath: "/blog",
      crawlCount: 2,
    });
  });

  it("getSiteAnalytics returns all aggregations from one fetch", async () => {
    const { client, from } = createMockSupabase({
      fromResults: {
        crawler_events: { data: sampleEvents, error: null },
      },
    });

    const analytics = await getSiteAnalytics(client, "site-1");

    expect(from).toHaveBeenCalledTimes(1);
    expect(analytics.overview.totalCrawls).toBe(4);
    expect(analytics.platforms).toHaveLength(3);
    expect(analytics.topPages).toHaveLength(3);
    expect(analytics.activityLog).toHaveLength(4);
    expect(analytics.weeklyActivity).toHaveLength(12);
    expect(
      analytics.weeklyActivity.reduce((sum, point) => sum + point.crawlCount, 0),
    ).toBe(4);
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
    expect(analytics.weeklyActivity).toEqual([]);
  });
});
