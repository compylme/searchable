import type {
  ActivityLogEvent,
  CrawlerEventRow,
  OverviewStats,
  PeriodActivityPoint,
  PlatformBreakdownItem,
  SiteAnalytics,
  TopPageItem,
} from "@/lib/analytics/types";
import type { Site } from "@/lib/sites/types";

export function makeCrawlerEvent(
  overrides: Partial<CrawlerEventRow> = {},
): CrawlerEventRow {
  return {
    received_at: "2026-06-15T12:00:00.000Z",
    bot_name: "GPTBot",
    platform: "OpenAI",
    bot_type: "ai",
    page_path: "/blog",
    page_url: "https://example.com/blog",
    user_agent: "GPTBot/1.0",
    ip_hash: null,
    ...overrides,
  };
}

export const sampleEvents: CrawlerEventRow[] = [
  makeCrawlerEvent({
    received_at: "2026-06-15T14:00:00.000Z",
    bot_name: "GPTBot",
    platform: "OpenAI",
    page_path: "/blog",
    page_url: "https://example.com/blog",
  }),
  makeCrawlerEvent({
    received_at: "2026-06-14T10:00:00.000Z",
    bot_name: "GPTBot",
    platform: "OpenAI",
    page_path: "/pricing",
    page_url: "https://example.com/pricing",
  }),
  makeCrawlerEvent({
    received_at: "2026-06-13T08:00:00.000Z",
    bot_name: "ClaudeBot",
    platform: "Anthropic",
    bot_type: "ai",
    page_path: "/blog",
    page_url: "https://example.com/blog",
    user_agent: "ClaudeBot/1.0",
  }),
  makeCrawlerEvent({
    received_at: "2026-05-20T09:00:00.000Z",
    bot_name: "Googlebot",
    platform: "Google",
    bot_type: "search",
    page_path: "/",
    page_url: "https://example.com/",
    user_agent: "Googlebot/2.1",
  }),
];

export const sampleActivityLogEvents: ActivityLogEvent[] = [
  {
    receivedAt: "2026-06-15T14:00:00.000Z",
    botName: "GPTBot",
    platform: "OpenAI",
    botType: "ai",
    pagePath: "/blog",
    pageUrl: "https://example.com/blog",
    userAgent: "GPTBot/1.0",
    ipHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  },
  {
    receivedAt: "2026-06-14T10:00:00.000Z",
    botName: "ClaudeBot",
    platform: "Anthropic",
    botType: "ai",
    pagePath: "/pricing",
    pageUrl: "https://example.com/pricing",
    userAgent: "ClaudeBot/1.0",
    ipHash: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  },
  {
    receivedAt: "2026-05-20T09:00:00.000Z",
    botName: "Googlebot",
    platform: "Google",
    botType: "search",
    pagePath: "/",
    pageUrl: "https://example.com/",
    userAgent: "Googlebot/2.1",
    ipHash: null,
  },
];

export const sampleSites: Site[] = [
  {
    id: "site-1",
    domain: "example.com",
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "site-2",
    domain: "acme.io",
    created_at: "2026-02-01T00:00:00.000Z",
  },
];

export const sampleOverviewStats: OverviewStats = {
  totalCrawls: 4,
  uniquePlatforms: 3,
  uniquePages: 3,
  uniqueBots: 3,
  lastSeenAt: "2026-06-15T14:00:00.000Z",
  topPlatform: "OpenAI",
  topPage: "/blog",
};

export const samplePlatforms: PlatformBreakdownItem[] = [
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
];

export const sampleTopPages: TopPageItem[] = [
  {
    pagePath: "/blog",
    pageUrl: "https://example.com/blog",
    crawlCount: 5,
    crawlers: ["ClaudeBot", "GPTBot"],
  },
  {
    pagePath: "/pricing",
    pageUrl: "https://example.com/pricing",
    crawlCount: 3,
    crawlers: ["GPTBot"],
  },
  {
    pagePath: "/about",
    pageUrl: "https://example.com/about",
    crawlCount: 1,
    crawlers: ["Googlebot"],
  },
];

export const samplePeriodActivity: PeriodActivityPoint[] = [
  { period: "24h", crawlCount: 0 },
  { period: "7d", crawlCount: 3 },
  { period: "30d", crawlCount: 4 },
];

export const sampleSiteAnalytics: SiteAnalytics = {
  overview: sampleOverviewStats,
  platforms: samplePlatforms,
  topPages: sampleTopPages,
  activityLog: sampleActivityLogEvents,
  periodActivity: samplePeriodActivity,
};
