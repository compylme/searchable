export type CrawlerEventRow = {
  received_at: string;
  bot_name: string | null;
  platform: string | null;
  bot_type: string;
  page_path: string | null;
  page_url: string;
  user_agent: string;
  ip_hash: string | null;
};

export type OverviewStats = {
  totalCrawls: number;
  uniquePlatforms: number;
  uniquePages: number;
  uniqueBots: number;
  lastSeenAt: string | null;
  topPlatform: string | null;
  topPage: string | null;
};

export type PlatformBreakdownItem = {
  platform: string;
  botName: string;
  botType: string;
  crawlCount: number;
  lastSeenAt: string | null;
};

export type TopPageItem = {
  pagePath: string;
  pageUrl: string;
  crawlCount: number;
  crawlers: string[];
};

export type ActivityLogEvent = {
  receivedAt: string;
  botName: string;
  platform: string;
  botType: string;
  pagePath: string;
  pageUrl: string;
  userAgent: string;
  ipHash: string | null;
};

export type ActivityPeriod = "24h" | "7d" | "30d";

export type PeriodActivityPoint = {
  period: ActivityPeriod;
  crawlCount: number;
};

export type SiteAnalytics = {
  overview: OverviewStats;
  platforms: PlatformBreakdownItem[];
  topPages: TopPageItem[];
  activityLog: ActivityLogEvent[];
  periodActivity: PeriodActivityPoint[];
};
