import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityLogEvent,
  CrawlerEventRow,
  OverviewStats,
  PlatformBreakdownItem,
  SiteAnalytics,
  TopPageItem,
} from "./types";

const UNKNOWN = "unknown";

async function fetchSiteEvents(
  supabase: SupabaseClient,
  siteId: string,
): Promise<CrawlerEventRow[]> {
  const { data, error } = await supabase
    .from("crawler_events")
    .select(
      "received_at, bot_name, platform, bot_type, page_path, page_url, user_agent",
    )
    .eq("site_id", siteId)
    .order("received_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load crawler events: ${error.message}`);
  }

  return (data ?? []) as CrawlerEventRow[];
}

function normalizeNullable(value: string | null): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : UNKNOWN;
}

function normalizePagePath(pagePath: string | null, pageUrl: string): string {
  const value = pagePath?.trim();
  if (value) return value;

  try {
    return new URL(pageUrl).pathname || "/";
  } catch {
    return "/";
  }
}

function laterTimestamp(
  current: string | null,
  candidate: string,
): string | null {
  if (!current) return candidate;
  return candidate > current ? candidate : current;
}

export function computeOverviewStats(events: CrawlerEventRow[]): OverviewStats {
  const platforms = new Set<string>();
  const pages = new Set<string>();
  const bots = new Set<string>();
  let lastSeenAt: string | null = null;

  for (const event of events) {
    platforms.add(normalizeNullable(event.platform));
    pages.add(normalizePagePath(event.page_path, event.page_url));
    bots.add(normalizeNullable(event.bot_name));
    lastSeenAt = laterTimestamp(lastSeenAt, event.received_at);
  }

  return {
    totalCrawls: events.length,
    uniquePlatforms: platforms.size,
    uniquePages: pages.size,
    uniqueBots: bots.size,
    lastSeenAt,
  };
}

export function computePlatformBreakdown(
  events: CrawlerEventRow[],
): PlatformBreakdownItem[] {
  const groups = new Map<string, PlatformBreakdownItem>();

  for (const event of events) {
    const platform = normalizeNullable(event.platform);
    const botName = normalizeNullable(event.bot_name);
    const key = `${platform}::${botName}`;
    const existing = groups.get(key);

    if (existing) {
      existing.crawlCount += 1;
      existing.lastSeenAt = laterTimestamp(
        existing.lastSeenAt,
        event.received_at,
      );
      continue;
    }

    groups.set(key, {
      platform,
      botName,
      botType: event.bot_type || UNKNOWN,
      crawlCount: 1,
      lastSeenAt: event.received_at,
    });
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.crawlCount - a.crawlCount || a.botName.localeCompare(b.botName),
  );
}

export function computeTopPages(events: CrawlerEventRow[]): TopPageItem[] {
  const groups = new Map<
    string,
    {
      pagePath: string;
      pageUrl: string;
      crawlCount: number;
      crawlers: Set<string>;
    }
  >();

  for (const event of events) {
    const pagePath = normalizePagePath(event.page_path, event.page_url);
    const existing = groups.get(pagePath);

    if (existing) {
      existing.crawlCount += 1;
      existing.crawlers.add(normalizeNullable(event.bot_name));
      continue;
    }

    groups.set(pagePath, {
      pagePath,
      pageUrl: event.page_url,
      crawlCount: 1,
      crawlers: new Set([normalizeNullable(event.bot_name)]),
    });
  }

  return Array.from(groups.values())
    .map((group) => ({
      pagePath: group.pagePath,
      pageUrl: group.pageUrl,
      crawlCount: group.crawlCount,
      crawlers: Array.from(group.crawlers).sort((a, b) => a.localeCompare(b)),
    }))
    .sort(
      (a, b) =>
        b.crawlCount - a.crawlCount || a.pagePath.localeCompare(b.pagePath),
    );
}

export function computeActivityLog(
  events: CrawlerEventRow[],
): ActivityLogEvent[] {
  return events
    .map((event) => ({
      receivedAt: event.received_at,
      botName: normalizeNullable(event.bot_name),
      platform: normalizeNullable(event.platform),
      botType: event.bot_type || UNKNOWN,
      pagePath: normalizePagePath(event.page_path, event.page_url),
      pageUrl: event.page_url,
      userAgent: event.user_agent || UNKNOWN,
    }))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function getOverviewStats(
  supabase: SupabaseClient,
  siteId: string,
): Promise<OverviewStats> {
  const events = await fetchSiteEvents(supabase, siteId);
  return computeOverviewStats(events);
}

export async function getPlatformBreakdown(
  supabase: SupabaseClient,
  siteId: string,
): Promise<PlatformBreakdownItem[]> {
  const events = await fetchSiteEvents(supabase, siteId);
  return computePlatformBreakdown(events);
}

export async function getTopPages(
  supabase: SupabaseClient,
  siteId: string,
): Promise<TopPageItem[]> {
  const events = await fetchSiteEvents(supabase, siteId);
  return computeTopPages(events);
}

/** Single fetch + all aggregations for the site activity page. */
export async function getSiteAnalytics(
  supabase: SupabaseClient,
  siteId: string,
): Promise<SiteAnalytics> {
  const events = await fetchSiteEvents(supabase, siteId);

  return {
    overview: computeOverviewStats(events),
    platforms: computePlatformBreakdown(events),
    topPages: computeTopPages(events),
    activityLog: computeActivityLog(events),
  };
}
