"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronRight, CircleHelp } from "lucide-react";

const SNIPPET = `<script
  defer
  src="https://ai-crawler-tracker.vercel.app/tracker.js"
  data-site-id="YOUR_TRACKING_ID"
  data-endpoint="https://trkaijnxdulrvtgcvddn.supabase.co/functions/v1/track"
></script>`;

export function TrackingSetup() {
  const t = useTranslations("TrackingSetup");
  const [open, setOpen] = useState(false);

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <CircleHelp
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-brand"
            />
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            {t("subtitle")}
          </p>
        </div>
        {open ? (
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

      {open && (
        <div className="border-t border-zinc-100 px-6 py-5 dark:border-zinc-800">
          <ol className="space-y-4">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1 text-sm text-zinc-700 dark:text-zinc-200">
                  {step}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              {t("snippetLabel")}
            </p>
            <pre className="overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs leading-relaxed text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <code>{SNIPPET}</code>
            </pre>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              {t("snippetHint")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
