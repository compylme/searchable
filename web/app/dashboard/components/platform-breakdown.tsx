"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, X } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PlatformBreakdownItem } from "@/lib/analytics/types";

type PlatformBreakdownProps = {
  platforms: PlatformBreakdownItem[];
};

export function PlatformBreakdown({ platforms }: PlatformBreakdownProps) {
  const t = useTranslations("SiteActivity");
  const titleId = useId();
  const [selected, setSelected] = useState<PlatformBreakdownItem | null>(null);

  useEffect(() => {
    if (!selected) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  if (platforms.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {t("emptyPlatforms")}
      </p>
    );
  }

  const chartData = platforms.map((item) => ({
    ...item,
    label: item.botName,
  }));

  return (
    <>
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <BarChart3 aria-hidden="true" className="h-4 w-4" />
          {t("chartTitle")}
        </h2>
        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
          {t("chartHint")}
        </p>

        <div className="mt-6 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
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
                cursor={{ fill: "rgba(113, 113, 122, 0.12)" }}
                contentStyle={{
                  background: "var(--background, #fff)",
                  border: "1px solid #e4e4e7",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value) => [value, t("crawlCount")]}
                labelFormatter={(label) => String(label)}
              />
              <Bar
                dataKey="crawlCount"
                fill="#18181b"
                radius={[6, 6, 0, 0]}
                className="dark:fill-zinc-100"
                cursor="pointer"
                onClick={(data) => {
                  const payload = data?.payload as
                    | PlatformBreakdownItem
                    | undefined;
                  if (payload) setSelected(payload);
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 p-4"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id={titleId}
                  className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  {t("modalTitle")}
                </h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {selected.botName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                <X aria-hidden="true" className="h-4 w-4" />
                {t("modalClose")}
              </button>
            </div>

            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t("platform")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selected.platform}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t("botName")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selected.botName}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t("botType")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selected.botType}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t("crawlCount")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selected.crawlCount}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {t("lastSeen")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  {selected.lastSeenAt
                    ? new Date(selected.lastSeenAt).toLocaleString()
                    : t("emptyDate")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
