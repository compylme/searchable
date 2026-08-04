import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityLogEvent,
  CrawlerEventRow,
  OverviewStats,
  PlatformBreakdownItem,
  SiteAnalytics,
  TopPageItem,
  WeeklyActivityPoint,
} from "./types";

const UNKNOWN = "unknown";
const DEFAULT_WEEKLY_WINDOW = 12;

async function fetchSiteEvents(
  supabase: SupabaseClient,
  siteId: string,
): Promise<CrawlerEventRow[]> {
  const { data, error } = await supabase
    .from("crawler_events")
    .select(
      "received_at, bot_name, platform, bot_type, page_path, page_url, user_agent, ip_hash",
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

function topCountedValue(counts: Map<string, number>): string | null {
  let topValue: string | null = null;
  let topCount = -1;

  for (const [value, count] of counts) {
    if (
      count > topCount ||
      (count === topCount &&
        (topValue === null || value.localeCompare(topValue) < 0))
    ) {
      topValue = value;
      topCount = count;
    }
  }

  return topValue;
}

export function computeOverviewStats(events: CrawlerEventRow[]): OverviewStats {
  const platforms = new Set<string>();
  const pages = new Set<string>();
  const bots = new Set<string>();
  const platformCounts = new Map<string, number>();
  const pageCounts = new Map<string, number>();
  let lastSeenAt: string | null = null;

  for (const event of events) {
    const platform = normalizeNullable(event.platform);
    const pagePath = normalizePagePath(event.page_path, event.page_url);

    platforms.add(platform);
    pages.add(pagePath);
    bots.add(normalizeNullable(event.bot_name));
    platformCounts.set(platform, (platformCounts.get(platform) ?? 0) + 1);
    pageCounts.set(pagePath, (pageCounts.get(pagePath) ?? 0) + 1);
    lastSeenAt = laterTimestamp(lastSeenAt, event.received_at);
  }

  return {
    totalCrawls: events.length,
    uniquePlatforms: platforms.size,
    uniquePages: pages.size,
    uniqueBots: bots.size,
    lastSeenAt,
    topPlatform: events.length === 0 ? null : topCountedValue(platformCounts),
    topPage: events.length === 0 ? null : topCountedValue(pageCounts),
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
      ipHash: event.ip_hash?.trim() || null,
    }))
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

function startOfWeekMonday(date: Date): Date {
  const next = new Date(date);
  next.setUTCHours(0, 0, 0, 0);
  const day = next.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  next.setUTCDate(next.getUTCDate() - diff);
  return next;
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWeekLabel(date: Date): string {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function computeWeeklyActivity(
  events: CrawlerEventRow[],
  options?: { weeks?: number; now?: Date },
): WeeklyActivityPoint[] {
  if (events.length === 0) {
    return [];
  }

  const weeks = options?.weeks ?? DEFAULT_WEEKLY_WINDOW;
  const now = options?.now ?? new Date();
  const currentWeekStart = startOfWeekMonday(now);
  const windowStart = addDays(currentWeekStart, -(weeks - 1) * 7);

  const counts = new Map<string, number>();
  for (let i = 0; i < weeks; i += 1) {
    const weekStart = addDays(windowStart, i * 7);
    counts.set(toIsoDate(weekStart), 0);
  }

  for (const event of events) {
    const received = new Date(event.received_at);
    if (Number.isNaN(received.getTime())) {
      continue;
    }

    const weekStart = startOfWeekMonday(received);
    const key = toIsoDate(weekStart);
    if (!counts.has(key)) {
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: WeeklyActivityPoint[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const weekStart = addDays(windowStart, i * 7);
    const key = toIsoDate(weekStart);
    points.push({
      weekStart: key,
      label: formatWeekLabel(weekStart),
      crawlCount: counts.get(key) ?? 0,
    });
  }

  return points;
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
    weeklyActivity: computeWeeklyActivity(events),
  };
}
