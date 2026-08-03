import { describe, expect, it } from "vitest";
import { computeActivityLog } from "@/lib/analytics/site-analytics";
import { makeCrawlerEvent, sampleEvents } from "../../helpers/test-fixtures";

describe("computeActivityLog", () => {
  it("returns an empty array for no events", () => {
    expect(computeActivityLog([])).toEqual([]);
  });

  it("maps rows to activity log events sorted newest first", () => {
    const result = computeActivityLog(sampleEvents);

    expect(result.map((event) => event.receivedAt)).toEqual([
      "2026-06-15T14:00:00.000Z",
      "2026-06-14T10:00:00.000Z",
      "2026-06-13T08:00:00.000Z",
      "2026-05-20T09:00:00.000Z",
    ]);

    expect(result[0]).toEqual({
      receivedAt: "2026-06-15T14:00:00.000Z",
      botName: "GPTBot",
      platform: "OpenAI",
      botType: "ai",
      pagePath: "/blog",
      pageUrl: "https://example.com/blog",
      userAgent: "GPTBot/1.0",
    });
  });

  it("normalizes nullish fields", () => {
    const result = computeActivityLog([
      makeCrawlerEvent({
        bot_name: null,
        platform: "  ",
        bot_type: "",
        page_path: null,
        page_url: "https://example.com/help",
        user_agent: "",
      }),
    ]);

    expect(result[0]).toMatchObject({
      botName: "unknown",
      platform: "unknown",
      botType: "unknown",
      pagePath: "/help",
      userAgent: "unknown",
    });
  });
});
