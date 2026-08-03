import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Globe } from "lucide-react";
import type { SiteAnalytics } from "@/lib/analytics/types";
import { SiteActivityTabs } from "./site-activity-tabs";

type SiteActivityProps = {
  domain: string;
  siteId: string;
  analytics: SiteAnalytics;
};

export async function SiteActivity({
  domain,
  siteId,
  analytics,
}: SiteActivityProps) {
  const t = await getTranslations("SiteActivity");

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-5xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {t("backToDashboard")}
        </Link>

        <div className="mt-6">
          <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            <Globe aria-hidden="true" className="h-5 w-5 shrink-0" />
            {domain}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {siteId}
          </p>
        </div>

        <SiteActivityTabs analytics={analytics} />
      </div>
    </main>
  );
}
