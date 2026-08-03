import { describe, expect, it } from "vitest";
import { computePlatformBreakdown } from "@/lib/analytics/site-analytics";
import { makeCrawlerEvent, sampleEvents } from "../../helpers/test-fixtures";

describe("computePlatformBreakdown", () => {
  it("returns an empty array for no events", () => {
    expect(computePlatformBreakdown([])).toEqual([]);
  });

  it("groups by platform and bot name, sorted by crawl count", () => {
    const result = computePlatformBreakdown(sampleEvents);

    expect(result).toEqual([
      {
        platform: "OpenAI",
        botName: "GPTBot",
        botType: "ai",
        crawlCount: 2,
        lastSeenAt: "2026-06-15T14:00:00.000Z",
      },
      {
        platform: "Anthropic",
        botName: "ClaudeBot",
        botType: "ai",
        crawlCount: 1,
        lastSeenAt: "2026-06-13T08:00:00.000Z",
      },
      {
        platform: "Google",
        botName: "Googlebot",
        botType: "search",
        crawlCount: 1,
        lastSeenAt: "2026-05-20T09:00:00.000Z",
      },
    ]);
  });

  it("ties crawl counts with bot name localeCompare", () => {
    const result = computePlatformBreakdown([
      makeCrawlerEvent({ bot_name: "ZetaBot", platform: "A" }),
      makeCrawlerEvent({ bot_name: "AlphaBot", platform: "B" }),
    ]);

    expect(result.map((item) => item.botName)).toEqual([
      "AlphaBot",
      "ZetaBot",
    ]);
  });

  it("normalizes null platform/bot and empty bot_type", () => {
    const result = computePlatformBreakdown([
      makeCrawlerEvent({
        platform: null,
        bot_name: null,
        bot_type: "",
      }),
    ]);

    expect(result).toEqual([
      {
        platform: "unknown",
        botName: "unknown",
        botType: "unknown",
        crawlCount: 1,
        lastSeenAt: "2026-06-15T12:00:00.000Z",
      },
    ]);
  });

  it("keeps the later lastSeenAt when aggregating", () => {
    const result = computePlatformBreakdown([
      makeCrawlerEvent({
        received_at: "2026-06-10T00:00:00.000Z",
        bot_name: "GPTBot",
        platform: "OpenAI",
      }),
      makeCrawlerEvent({
        received_at: "2026-06-20T00:00:00.000Z",
        bot_name: "GPTBot",
        platform: "OpenAI",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].crawlCount).toBe(2);
    expect(result[0].lastSeenAt).toBe("2026-06-20T00:00:00.000Z");
  });
});
