"use client";

import { useTranslations } from "next-intl";
import { ChartColumn } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ActivityPeriod,
  PeriodActivityPoint,
} from "@/lib/analytics/types";

type PeriodActivityChartProps = {
  data: PeriodActivityPoint[];
};

export function PeriodActivityChart({ data }: PeriodActivityChartProps) {
  const t = useTranslations("SiteActivity");

  if (data.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {t("emptyPeriodActivity")}
      </p>
    );
  }

  const periodLabels: Record<ActivityPeriod, string> = {
    "24h": t("period24h"),
    "7d": t("period7d"),
    "30d": t("period30d"),
  };

  const chartData = data.map((point) => ({
    ...point,
    label: periodLabels[point.period],
  }));

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-zinc-500">
        <ChartColumn aria-hidden="true" className="h-4 w-4 text-brand" />
        {t("periodActivityTitle")}
      </h2>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        {t("periodActivityHint")}
      </p>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-zinc-500"
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-zinc-500"
              width={40}
            />
            <Tooltip
              cursor={{ fill: "rgba(113, 113, 122, 0.12)" }}
              contentStyle={{
                background: "var(--surface, #fff)",
                border: "1px solid #e4e4e7",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => [value, t("crawlCount")]}
              labelFormatter={(label) => String(label)}
            />
            <Bar
              dataKey="crawlCount"
              fill="#c15f3c"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
