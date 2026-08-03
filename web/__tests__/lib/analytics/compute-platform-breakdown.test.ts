import { describe, expect, it } from "vitest";
import { computePlatformBreakdown } from "@/lib/analytics/site-analytics";
import { sampleEvents } from "../../helpers/test-fixtures";

describe("computePlatformBreakdown", () => {
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
});
