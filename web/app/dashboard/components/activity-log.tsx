"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ActivityLogEvent } from "@/lib/analytics/types";

type PresetFilter = "today" | "week" | "month" | "year" | null;

type MonthGroup = {
  key: string;
  label: string;
  events: ActivityLogEvent[];
};

type ActivityLogProps = {
  events: ActivityLogEvent[];
};

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
    ? "rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
    : "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";
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

export function ActivityLog({ events }: ActivityLogProps) {
  const t = useTranslations("SiteActivity");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [preset, setPreset] = useState<PresetFilter>(null);
  const [selectedBots, setSelectedBots] = useState<Set<string>>(new Set());
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set(),
  );
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

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

    return Array.from(groups.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, monthEvents]): MonthGroup => ({
        key,
        label: monthLabel(key),
        events: monthEvents,
      }));
  }, [filteredEvents]);

  function clearFilters() {
    setPreset(null);
    setSelectedBots(new Set());
    setSelectedPlatforms(new Set());
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
              <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 text-xs font-medium normal-case tracking-normal text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
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
                  className="shrink-0 text-sm font-medium text-zinc-500 underline-offset-4 transition hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  {t("clearFilters")}
                </button>
              )}
            </div>
          </div>
        )}
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
                    <table className="w-full min-w-[640px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                          <th className="px-6 py-3 font-medium">
                            {t("logCrawler")}
                          </th>
                          <th className="px-6 py-3 font-medium">
                            {t("logPage")}
                          </th>
                          <th className="px-6 py-3 font-medium">
                            {t("logDate")}
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
