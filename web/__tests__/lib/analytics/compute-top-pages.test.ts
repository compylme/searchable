import { describe, expect, it } from "vitest";
import { computeTopPages } from "@/lib/analytics/site-analytics";
import { sampleEvents } from "../../helpers/test-fixtures";

describe("computeTopPages", () => {
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
});
