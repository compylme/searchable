"use client";

import { useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Layers,
  LayoutDashboard,
  ScrollText,
} from "lucide-react";
import type { SiteAnalytics } from "@/lib/analytics/types";
import { ActivityLog } from "./activity-log";
import { OverviewStats } from "./overview-stats";
import { PlatformBreakdown } from "./platform-breakdown";
import { TopPagesTable } from "./top-pages-table";

type TabId = "overview" | "platforms" | "topPages" | "activityLog";

type SiteActivityTabsProps = {
  analytics: SiteAnalytics;
};

const TAB_ICONS: Record<
  TabId,
  ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>
> = {
  overview: LayoutDashboard,
  platforms: Layers,
  topPages: FileText,
  activityLog: ScrollText,
};

export function SiteActivityTabs({ analytics }: SiteActivityTabsProps) {
  const t = useTranslations("SiteActivity");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("tabOverview") },
    { id: "platforms", label: t("tabPlatforms") },
    { id: "topPages", label: t("tabTopPages") },
    { id: "activityLog", label: t("tabActivityLog") },
  ];

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          const Icon = TAB_ICONS[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              id={`site-tab-${tab.id}`}
              aria-controls={`site-panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={
                selected
                  ? "inline-flex items-center gap-1.5 border-b-2 border-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                  : "inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <div
          role="tabpanel"
          id="site-panel-overview"
          aria-labelledby="site-tab-overview"
          hidden={activeTab !== "overview"}
        >
          {activeTab === "overview" && (
            <OverviewStats stats={analytics.overview} />
          )}
        </div>

        <div
          role="tabpanel"
          id="site-panel-platforms"
          aria-labelledby="site-tab-platforms"
          hidden={activeTab !== "platforms"}
        >
          {activeTab === "platforms" && (
            <PlatformBreakdown platforms={analytics.platforms} />
          )}
        </div>

        <div
          role="tabpanel"
          id="site-panel-topPages"
          aria-labelledby="site-tab-topPages"
          hidden={activeTab !== "topPages"}
        >
          {activeTab === "topPages" && (
            <TopPagesTable pages={analytics.topPages} />
          )}
        </div>

        <div
          role="tabpanel"
          id="site-panel-activityLog"
          aria-labelledby="site-tab-activityLog"
          hidden={activeTab !== "activityLog"}
        >
          {activeTab === "activityLog" && (
            <ActivityLog events={analytics.activityLog} />
          )}
        </div>
      </div>
    </div>
  );
}
