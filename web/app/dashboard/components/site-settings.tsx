"use client";

import { useCallback, useState } from "react";
import { flushSync } from "react-dom";
import { useTranslations } from "next-intl";
import { Check, Code2, Copy, Download, LoaderCircle } from "lucide-react";
import type { ActivityLogEvent } from "@/lib/analytics/types";
import {
  activityLogCsvFilename,
  downloadCsv,
  toActivityLogCsv,
} from "@/lib/analytics/export-csv";
import { buildTrackingSnippet } from "@/lib/tracking/snippet";

type SiteSettingsProps = {
  siteId: string;
  domain: string;
  events: ActivityLogEvent[];
};

export function SiteSettings({ siteId, domain, events }: SiteSettingsProps) {
  const t = useTranslations("SiteActivity");
  const snippet = buildTrackingSnippet(siteId);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const copySnippet = useCallback(async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [snippet]);

  async function handleExportCsv() {
    if (exporting || events.length === 0) return;

    flushSync(() => {
      setExporting(true);
    });

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      const csv = toActivityLogCsv(events);
      downloadCsv(activityLogCsvFilename(domain), csv);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-zinc-500">
          <Code2 aria-hidden="true" className="h-4 w-4 text-brand" />
          {t("settingsTrackingTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {t("settingsTrackingHint")}
        </p>

        <pre className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          <code>{snippet}</code>
        </pre>

        <button
          type="button"
          onClick={copySnippet}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {copied ? (
            <Check aria-hidden="true" className="h-4 w-4 text-brand" />
          ) : (
            <Copy aria-hidden="true" className="h-4 w-4" />
          )}
          {copied ? t("settingsCopied") : t("settingsCopySnippet")}
        </button>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wide text-zinc-500">
          <Download aria-hidden="true" className="h-4 w-4 text-brand" />
          {t("settingsExportTitle")}
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          {t("settingsExportHint")}
        </p>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={exporting || events.length === 0}
          aria-busy={exporting}
          aria-label={exporting ? t("exportingCsv") : t("exportCsv")}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          {exporting ? (
            <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Download aria-hidden="true" className="h-4 w-4" />
          )}
          {exporting ? t("exportingCsv") : t("exportCsv")}
        </button>
      </section>
    </div>
  );
}
