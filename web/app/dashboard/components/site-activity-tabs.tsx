"use client";

import { useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  FileText,
  Layers,
  LayoutDashboard,
  ScrollText,
  Settings,
} from "lucide-react";
import type { SiteAnalytics } from "@/lib/analytics/types";
import { ActivityLog } from "./activity-log";
import { OverviewStats } from "./overview-stats";
import { PlatformBreakdown } from "./platform-breakdown";
import { SiteSettings } from "./site-settings";
import { TopPagesTable } from "./top-pages-table";
import { PeriodActivityChart } from "./period-activity-chart";

type TabId = "overview" | "platforms" | "topPages" | "activityLog" | "settings";

type SiteActivityTabsProps = {
  domain: string;
  siteId: string;
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
  settings: Settings,
};

function tabClassName(selected: boolean): string {
  return selected
    ? "inline-flex items-center gap-1.5 border-b-2 border-brand px-4 py-2.5 text-sm font-medium text-brand"
    : "inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900";
}

export function SiteActivityTabs({
  domain,
  siteId,
  analytics,
}: SiteActivityTabsProps) {
  const t = useTranslations("SiteActivity");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: t("tabOverview") },
    { id: "platforms", label: t("tabPlatforms") },
    { id: "topPages", label: t("tabTopPages") },
    { id: "activityLog", label: t("tabActivityLog") },
    { id: "settings", label: t("tabSettings") },
  ];

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="flex gap-1 border-b border-zinc-200"
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
              className={tabClassName(selected)}
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
            <div className="space-y-6">
              <OverviewStats stats={analytics.overview} />
              {analytics.periodActivity.length > 0 && (
                <PeriodActivityChart data={analytics.periodActivity} />
              )}
            </div>
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
            <ActivityLog domain={domain} events={analytics.activityLog} />
          )}
        </div>

        <div
          role="tabpanel"
          id="site-panel-settings"
          aria-labelledby="site-tab-settings"
          hidden={activeTab !== "settings"}
        >
          {activeTab === "settings" && (
            <SiteSettings
              siteId={siteId}
              domain={domain}
              events={analytics.activityLog}
            />
          )}
        </div>
      </div>
    </div>
  );
}
