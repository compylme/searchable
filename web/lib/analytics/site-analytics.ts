import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityLogEvent,
  ActivityPeriod,
  ActivityTrendDelta,
  ActivityTrendPoint,
  CrawlerEventRow,
  OverviewStats,
  PeriodActivityPoint,
  PlatformBreakdownItem,
  SiteAnalytics,
  TopPageItem,
} from "./types";

const UNKNOWN = "unknown";
const DEFAULT_TREND_WEEKS = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

const ACTIVITY_PERIODS: { period: ActivityPeriod; ms: number }[] = [
  { period: "24h", ms: DAY_MS },
  { period: "7d", ms: WEEK_MS },
  { period: "30d", ms: 30 * DAY_MS },
];

async function fetchSiteEvents(
  supabase: SupabaseClient,
  siteId: string,
): Promise<CrawlerEventRow[]> {
  const { data, error } = await supabase
    .from("crawler_events")
    .select(
      "timestamp, bot_name, platform, bot_type, page_path, page_url, user_agent, ip_hash",
    )
    .eq("site_id", siteId)
    .order("timestamp", { ascending: false });

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
    lastSeenAt = laterTimestamp(lastSeenAt, event.timestamp);
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
        event.timestamp,
      );
      continue;
    }

    groups.set(key, {
      platform,
      botName,
      botType: event.bot_type || UNKNOWN,
      crawlCount: 1,
      lastSeenAt: event.timestamp,
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
      receivedAt: event.timestamp,
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

export function computePeriodActivity(
  events: CrawlerEventRow[],
  options?: { now?: Date },
): PeriodActivityPoint[] {
  if (events.length === 0) {
    return [];
  }

  const nowMs = (options?.now ?? new Date()).getTime();
  const counts: Record<ActivityPeriod, number> = {
    "24h": 0,
    "7d": 0,
    "30d": 0,
  };

  for (const event of events) {
    const receivedMs = new Date(event.timestamp).getTime();
    if (Number.isNaN(receivedMs)) {
      continue;
    }

    const ageMs = nowMs - receivedMs;
    if (ageMs < 0) {
      continue;
    }

    for (const { period, ms } of ACTIVITY_PERIODS) {
      if (ageMs <= ms) {
        counts[period] += 1;
      }
    }
  }

  return ACTIVITY_PERIODS.map(({ period }) => ({
    period,
    crawlCount: counts[period],
  }));
}

function startOfWeekMonday(date: Date): Date {
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
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

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function computeActivityTrend(
  events: CrawlerEventRow[],
  options?: { weeks?: number; now?: Date },
): ActivityTrendPoint[] {
  if (events.length === 0) {
    return [];
  }

  const weeks = options?.weeks ?? DEFAULT_TREND_WEEKS;
  const now = options?.now ?? new Date();
  const currentWeekStart = startOfWeekMonday(now);
  const windowStart = addUtcDays(currentWeekStart, -(weeks - 1) * 7);

  const counts = new Map<string, number>();
  for (let i = 0; i < weeks; i += 1) {
    counts.set(toIsoDate(addUtcDays(windowStart, i * 7)), 0);
  }

  for (const event of events) {
    const received = new Date(event.timestamp);
    if (Number.isNaN(received.getTime())) {
      continue;
    }

    const key = toIsoDate(startOfWeekMonday(received));
    if (!counts.has(key)) {
      continue;
    }
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: ActivityTrendPoint[] = [];
  for (let i = 0; i < weeks; i += 1) {
    const weekStart = addUtcDays(windowStart, i * 7);
    const key = toIsoDate(weekStart);
    points.push({
      date: key,
      label: formatWeekLabel(weekStart),
      crawlCount: counts.get(key) ?? 0,
    });
  }

  return points;
}

export function computeActivityTrendDelta(
  events: CrawlerEventRow[],
  options?: { now?: Date },
): ActivityTrendDelta | null {
  if (events.length === 0) {
    return null;
  }

  const nowMs = (options?.now ?? new Date()).getTime();
  let current = 0;
  let previous = 0;

  for (const event of events) {
    const receivedMs = new Date(event.timestamp).getTime();
    if (Number.isNaN(receivedMs)) {
      continue;
    }

    const ageMs = nowMs - receivedMs;
    if (ageMs < 0) {
      continue;
    }

    if (ageMs <= WEEK_MS) {
      current += 1;
    } else if (ageMs <= WEEK_MS * 2) {
      previous += 1;
    }
  }

  if (current === 0 && previous === 0) {
    return { direction: "flat", percent: 0 };
  }

  if (previous === 0) {
    return { direction: "up", percent: null };
  }

  const percent = Math.round(((current - previous) / previous) * 100);
  if (percent > 0) {
    return { direction: "up", percent };
  }
  if (percent < 0) {
    return { direction: "down", percent: Math.abs(percent) };
  }
  return { direction: "flat", percent: 0 };
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
    periodActivity: computePeriodActivity(events),
    activityTrend: computeActivityTrend(events),
    activityTrendDelta: computeActivityTrendDelta(events),
  };
}
