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

export function ActivityLog({ events }: ActivityLogProps) {
  const t = useTranslations("SiteActivity");
  const [preset, setPreset] = useState<PresetFilter>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    const range = getPresetRange(preset);
    if (!range) return events;

    return events.filter((event) => {
      const received = new Date(event.receivedAt).getTime();
      if (received < range.from.getTime()) return false;
      if (received > range.to.getTime()) return false;
      return true;
    });
  }, [events, preset]);

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
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-wrap gap-2">
          {presets.map((item) => {
            const selected = preset === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreset(selected ? null : item.id)}
                className={
                  selected
                    ? "rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                    : "rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
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
