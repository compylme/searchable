"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
} from "lucide-react";
import {
  activityLogCsvFilename,
  downloadCsv,
  toActivityLogCsv,
} from "@/lib/analytics/export-csv";
import type { ActivityLogEvent } from "@/lib/analytics/types";

type PresetFilter = "today" | "week" | "month" | "year" | null;
type SortKey = "receivedAt" | "ipHash";
type SortDirection = "asc" | "desc";

type MonthGroup = {
  key: string;
  label: string;
  events: ActivityLogEvent[];
};

type ActivityLogProps = {
  domain: string;
  events: ActivityLogEvent[];
};

function SortIcon({
  column,
  sortKey,
  sortDirection,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDirection: SortDirection;
}) {
  if (sortKey !== column) {
    return <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />;
  }
  if (sortDirection === "asc") {
    return <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />;
  }
  return <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />;
}

function formatIpHash(ipHash: string | null): string {
  if (!ipHash) return "—";
  return ipHash.length > 12 ? `${ipHash.slice(0, 12)}…` : ipHash;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeek(date: Date): Date {
  const next = startOfDay(date);
  const day = next.getDay();
  const diff = day === 0 ? 6 : day - 1;
  next.setDate(next.getDate() - diff);
  return next;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function getPresetRange(preset: PresetFilter): { from: Date; to: Date } | null {
  if (!preset) return null;
  const now = new Date();
  const to = endOfDay(now);

  switch (preset) {
    case "today":
      return { from: startOfDay(now), to };
    case "week":
      return { from: startOfWeek(now), to };
    case "month":
      return { from: startOfMonth(now), to };
    case "year":
      return { from: startOfYear(now), to };
  }
}

function monthKey(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function distinctSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function chipClassName(selected: boolean): string {
  return selected
    ? "rounded-lg bg-brand px-3 py-1.5 text-sm font-medium text-white"
    : "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50";
}

function toggleInSet(current: Set<string>, value: string): Set<string> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function ActivityLog({ domain, events }: ActivityLogProps) {
  const t = useTranslations("SiteActivity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [preset, setPreset] = useState<PresetFilter>(null);
  const [selectedBots, setSelectedBots] = useState<Set<string>>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set(),
  );
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("receivedAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const botOptions = useMemo(
    () => distinctSorted(events.map((event) => event.botName)),
    [events],
  );

  const platformOptions = useMemo(
    () => distinctSorted(events.map((event) => event.platform)),
    [events],
  );

  const hasActiveFilters =
    preset !== null || selectedBots.size > 0 || selectedPlatforms.size > 0;

  const filteredEvents = useMemo(() => {
    const range = getPresetRange(preset);

    return events.filter((event) => {
      if (range) {
        const received = new Date(event.receivedAt).getTime();
        if (received < range.from.getTime()) return false;
        if (received > range.to.getTime()) return false;
      }

      if (selectedBots.size > 0 && !selectedBots.has(event.botName)) {
        return false;
      }

      if (
        selectedPlatforms.size > 0 &&
        !selectedPlatforms.has(event.platform)
      ) {
        return false;
      }

      return true;
    });
  }, [events, preset, selectedBots, selectedPlatforms]);

  const monthGroups = useMemo(() => {
    const groups = new Map<string, ActivityLogEvent[]>();

    for (const event of filteredEvents) {
      const key = monthKey(event.receivedAt);
      const existing = groups.get(key);
      if (existing) {
        existing.push(event);
      } else {
        groups.set(key, [event]);
      }
    }

    function compareEvents(a: ActivityLogEvent, b: ActivityLogEvent): number {
      let comparison = 0;
      if (sortKey === "ipHash") {
        comparison = (a.ipHash ?? "").localeCompare(b.ipHash ?? "");
      } else {
        comparison = a.receivedAt.localeCompare(b.receivedAt);
      }
      return sortDirection === "asc" ? comparison : -comparison;
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, monthEvents]): MonthGroup => ({
        key,
        label: monthLabel(key),
        events: [...monthEvents].sort(compareEvents),
      }));
  }, [filteredEvents, sortKey, sortDirection]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "receivedAt" ? "desc" : "asc");
  }

  function sortAriaLabel(key: SortKey) {
    const column =
      key === "ipHash" ? t("sortByIpHash") : t("sortByDate");
    const direction =
      sortKey === key && sortDirection === "asc"
        ? t("sortAscending")
        : t("sortDescending");
    return `${column}, ${direction}`;
  }

  function clearFilters() {
    setPreset(null);
    setSelectedBots(new Set());
    setSelectedPlatforms(new Set());
  }

  async function handleExportCsv() {
    if (exporting || filteredEvents.length === 0) return;

    flushSync(() => {
      setExporting(true);
    });

    try {
      // Wait for the busy UI (spinner + wait cursor) to paint before generating.
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      const csv = toActivityLogCsv(filteredEvents);
      downloadCsv(activityLogCsvFilename(domain), csv);
    } finally {
      setExporting(false);
    }
  }

  function toggleMonth(key: string) {
    setExpandedMonths((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const presets: { id: Exclude<PresetFilter, null>; label: string }[] = [
    { id: "today", label: t("filterToday") },
    { id: "week", label: t("filterWeek") },
    { id: "month", label: t("filterMonth") },
    { id: "year", label: t("filterYear") },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={() => setFiltersOpen((current) => !current)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("filtersTitle")}
            {hasActiveFilters && (
              <span className="rounded-md bg-brand-muted px-1.5 py-0.5 text-xs font-medium normal-case tracking-normal text-brand">
                {(preset ? 1 : 0) + selectedBots.size + selectedPlatforms.size}
              </span>
            )}
          </span>
          {filtersOpen ? (
            <ChevronDown
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
            />
          ) : (
            <ChevronRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-zinc-500 dark:text-zinc-400"
            />
          )}
        </button>

        {filtersOpen && (
          <div className="border-t border-zinc-100 px-4 py-4 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-5">
                <section>
                  <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    {t("filterByTime")}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((item) => {
                      const selected = preset === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPreset(selected ? null : item.id)}
                          className={chipClassName(selected)}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </section>

                {botOptions.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t("filterByBot")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {botOptions.map((bot) => {
                        const selected = selectedBots.has(bot);
                        return (
                          <button
                            key={bot}
                            type="button"
                            onClick={() =>
                              setSelectedBots((current) =>
                                toggleInSet(current, bot),
                              )
                            }
                            className={chipClassName(selected)}
                          >
                            {bot}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {platformOptions.length > 0 && (
                  <section>
                    <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {t("filterByPlatform")}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {platformOptions.map((platform) => {
                        const selected = selectedPlatforms.has(platform);
                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() =>
                              setSelectedPlatforms((current) =>
                                toggleInSet(current, platform),
                              )
                            }
                            className={chipClassName(selected)}
                          >
                            {platform}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="shrink-0 text-sm font-medium text-zinc-500 underline-offset-4 transition hover:text-brand hover:underline"
                >
                  {t("clearFilters")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t("showingEvents", { count: filteredEvents.length })}
        </p>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={exporting || filteredEvents.length === 0}
          aria-busy={exporting}
          aria-label={exporting ? t("exportingCsv") : t("exportCsv")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {exporting ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Download aria-hidden="true" className="h-4 w-4" />
          )}
          {exporting ? t("exportingCsv") : t("exportCsv")}
        </button>
      </div>

      {monthGroups.length === 0 ? (
        <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
          {t("emptyActivityLog")}
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {monthGroups.map((group) => {
            const expanded = expandedMonths.has(group.key);
            return (
              <div
                key={group.key}
                className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
              >
                <button
                  type="button"
                  onClick={() => toggleMonth(group.key)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {group.label}
                  </span>
                  <span className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {group.events.length} {t("logEvents")}
                    {expanded ? (
                      <ChevronDown aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <ChevronRight aria-hidden="true" className="h-4 w-4" />
                    )}
                  </span>
                </button>

                {expanded && (
                  <div className="overflow-x-auto border-t border-zinc-100 dark:border-zinc-800">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                          <th className="px-6 py-3 font-medium">
                            {t("logCrawler")}
                          </th>
                          <th className="px-6 py-3 font-medium">
                            {t("logPage")}
                          </th>
                          <th className="px-6 py-3 font-medium">
                            <button
                              type="button"
                              onClick={() => toggleSort("ipHash")}
                              aria-label={sortAriaLabel("ipHash")}
                              className="inline-flex items-center gap-1.5 transition hover:text-zinc-900 dark:hover:text-zinc-50"
                            >
                              {t("logIpHash")}
                              <SortIcon
                                column="ipHash"
                                sortKey={sortKey}
                                sortDirection={sortDirection}
                              />
                            </button>
                          </th>
                          <th className="px-6 py-3 font-medium">
                            <button
                              type="button"
                              onClick={() => toggleSort("receivedAt")}
                              aria-label={sortAriaLabel("receivedAt")}
                              className="inline-flex items-center gap-1.5 transition hover:text-zinc-900 dark:hover:text-zinc-50"
                            >
                              {t("logDate")}
                              <SortIcon
                                column="receivedAt"
                                sortKey={sortKey}
                                sortDirection={sortDirection}
                              />
                            </button>
                          </th>
                          <th className="px-6 py-3 font-medium">
                            {t("logTime")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.events.map((event, index) => (
                          <tr
                            key={`${event.receivedAt}-${event.pagePath}-${index}`}
                            className="border-b border-zinc-100 last:border-b-0 dark:border-zinc-800"
                          >
                            <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-50">
                              {event.botName !== "unknown"
                                ? event.botName
                                : event.platform}
                            </td>
                            <td className="px-6 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                              {event.pagePath}
                            </td>
                            <td
                              className="px-6 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-300"
                              title={event.ipHash ?? undefined}
                            >
                              {formatIpHash(event.ipHash)}
                            </td>
                            <td className="px-6 py-3 text-zinc-600 dark:text-zinc-300">
                              {formatDate(event.receivedAt)}
                            </td>
                            <td className="px-6 py-3 text-zinc-600 dark:text-zinc-300">
                              {formatTime(event.receivedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
