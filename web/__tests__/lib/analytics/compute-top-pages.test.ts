import { describe, expect, it } from "vitest";
import { computeTopPages } from "@/lib/analytics/site-analytics";
import { makeCrawlerEvent, sampleEvents } from "../../helpers/test-fixtures";

describe("computeTopPages", () => {
  it("returns an empty array for no events", () => {
    expect(computeTopPages([])).toEqual([]);
  });

  it("groups by page path with sorted crawlers and crawl counts", () => {
    const result = computeTopPages(sampleEvents);

    expect(result).toEqual([
      {
        pagePath: "/blog",
        pageUrl: "https://example.com/blog",
        crawlCount: 2,
        crawlers: ["ClaudeBot", "GPTBot"],
      },
      {
        pagePath: "/",
        pageUrl: "https://example.com/",
        crawlCount: 1,
        crawlers: ["Googlebot"],
      },
      {
        pagePath: "/pricing",
        pageUrl: "https://example.com/pricing",
        crawlCount: 1,
        crawlers: ["GPTBot"],
      },
    ]);
  });

  it("deduplicates crawler names per page", () => {
    const result = computeTopPages([
      makeCrawlerEvent({ page_path: "/blog", bot_name: "GPTBot" }),
      makeCrawlerEvent({
        page_path: "/blog",
        bot_name: "GPTBot",
        received_at: "2026-06-16T00:00:00.000Z",
      }),
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].crawlCount).toBe(2);
    expect(result[0].crawlers).toEqual(["GPTBot"]);
  });

  it("derives page path from URL when page_path is missing", () => {
    const result = computeTopPages([
      makeCrawlerEvent({
        page_path: null,
        page_url: "https://example.com/docs?q=1",
      }),
    ]);

    expect(result[0].pagePath).toBe("/docs");
  });

  it("sorts equal crawl counts by page path", () => {
    const result = computeTopPages([
      makeCrawlerEvent({ page_path: "/zeta" }),
      makeCrawlerEvent({ page_path: "/alpha" }),
    ]);

    expect(result.map((page) => page.pagePath)).toEqual(["/alpha", "/zeta"]);
  });
});
