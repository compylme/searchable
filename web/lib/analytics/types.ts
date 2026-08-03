export type CrawlerEventRow = {
  received_at: string;
  bot_name: string | null;
  platform: string | null;
  bot_type: string;
  page_path: string | null;
  page_url: string;
  user_agent: string;
};

export type OverviewStats = {
  totalCrawls: number;
  uniquePlatforms: number;
  uniquePages: number;
  uniqueBots: number;
  lastSeenAt: string | null;
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
};

export type SiteAnalytics = {
  overview: OverviewStats;
  platforms: PlatformBreakdownItem[];
  topPages: TopPageItem[];
  activityLog: ActivityLogEvent[];
};
