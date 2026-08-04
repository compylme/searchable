"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowRight, ArrowUp, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  ActivityTrendDelta,
  ActivityTrendPoint,
} from "@/lib/analytics/types";

type ActivityTrendChartProps = {
  data: ActivityTrendPoint[];
  delta: ActivityTrendDelta | null;
};

function TrendBadge({ delta }: { delta: ActivityTrendDelta }) {
  const t = useTranslations("SiteActivity");

  const styles =
    delta.direction === "up"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
      : delta.direction === "down"
        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300";

  const Icon =
    delta.direction === "up"
      ? ArrowUp
      : delta.direction === "down"
        ? ArrowDown
        : ArrowRight;

  const label =
    delta.direction === "up" && delta.percent === null
      ? t("trendDeltaNew")
      : delta.direction === "flat"
        ? t("trendDeltaFlat")
        : t("trendDeltaPercent", { percent: delta.percent ?? 0 });

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${styles}`}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

export function ActivityTrendChart({ data, delta }: ActivityTrendChartProps) {
  const t = useTranslations("SiteActivity");

  if (data.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {t("emptyActivityTrend")}
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-zinc-500">
          <TrendingUp aria-hidden="true" className="h-4 w-4 text-brand" />
          {t("activityTrendTitle")}
        </h2>
        {delta && <TrendBadge delta={delta} />}
      </div>
      <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
        {t("activityTrendHint")}
      </p>

      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-zinc-200 dark:stroke-zinc-800"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-zinc-500"
              interval="preserveStartEnd"
              angle={-30}
              textAnchor="end"
              height={60}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "currentColor", fontSize: 12 }}
              className="text-zinc-500"
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface, #fff)",
                border: "1px solid #e4e4e7",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(value) => [value, t("crawlCount")]}
              labelFormatter={(label) => String(label)}
            />
            <Line
              type="monotone"
              dataKey="crawlCount"
              stroke="#c15f3c"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
