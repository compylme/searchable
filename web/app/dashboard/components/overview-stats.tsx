"use client";

import type { ComponentType } from "react";
import { useTranslations } from "next-intl";
import { Activity, Bot, Clock, FileText, Layers } from "lucide-react";
import type { OverviewStats as OverviewStatsData } from "@/lib/analytics/types";

type OverviewStatsProps = {
  stats: OverviewStatsData;
};

type StatCard = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
};

export function OverviewStats({ stats }: OverviewStatsProps) {
  const t = useTranslations("SiteActivity");

  if (stats.totalCrawls === 0) {
    return (
      <p className="flex flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        <Activity aria-hidden="true" className="h-5 w-5" />
        {t("emptyOverview")}
      </p>
    );
  }

  const cards: StatCard[] = [
    {
      label: t("totalCrawls"),
      value: String(stats.totalCrawls),
      icon: Activity,
    },
    {
      label: t("uniquePlatforms"),
      value: String(stats.uniquePlatforms),
      icon: Layers,
    },
    {
      label: t("uniquePages"),
      value: String(stats.uniquePages),
      icon: FileText,
    },
    {
      label: t("uniqueBots"),
      value: String(stats.uniqueBots),
      icon: Bot,
    },
    {
      label: t("lastSeen"),
      value: stats.lastSeenAt
        ? new Date(stats.lastSeenAt).toLocaleString()
        : t("emptyDate"),
      icon: Clock,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <Icon aria-hidden="true" className="h-3.5 w-3.5 text-brand" />
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
