"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { TopPageItem } from "@/lib/analytics/types";

type SortKey = "pagePath" | "crawlCount";
type SortDirection = "asc" | "desc";

type TopPagesTableProps = {
  pages: TopPageItem[];
};

export function TopPagesTable({ pages }: TopPagesTableProps) {
  const t = useTranslations("SiteActivity");
  const [sortKey, setSortKey] = useState<SortKey>("crawlCount");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedPages = useMemo(() => {
    const copy = [...pages];
    copy.sort((a, b) => {
      let comparison = 0;

      if (sortKey === "pagePath") {
        comparison = a.pagePath.localeCompare(b.pagePath);
      } else {
        comparison = a.crawlCount - b.crawlCount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
    return copy;
  }, [pages, sortKey, sortDirection]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection(key === "crawlCount" ? "desc" : "asc");
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) {
      return <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5" />;
    }
    if (sortDirection === "asc") {
      return <ArrowUp aria-hidden="true" className="h-3.5 w-3.5" />;
    }
    return <ArrowDown aria-hidden="true" className="h-3.5 w-3.5" />;
  }

  function sortAriaLabel(key: SortKey) {
    const column =
      key === "pagePath" ? t("sortByPath") : t("sortByCount");
    const direction =
      sortKey === key && sortDirection === "asc"
        ? t("sortAscending")
        : t("sortDescending");
    return `${column}, ${direction}`;
  }

  if (pages.length === 0) {
    return (
      <p className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        {t("emptyTopPages")}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-6 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("pagePath")}
                  aria-label={sortAriaLabel("pagePath")}
                  className="inline-flex items-center gap-1.5 transition hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  {t("pagePath")}
                  <SortIcon column="pagePath" />
                </button>
              </th>
              <th className="px-6 py-3 font-medium">{t("crawlers")}</th>
              <th className="px-6 py-3 font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("crawlCount")}
                  aria-label={sortAriaLabel("crawlCount")}
                  className="inline-flex items-center gap-1.5 transition hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  {t("crawlCount")}
                  <SortIcon column="crawlCount" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPages.map((page) => (
              <tr
                key={page.pagePath}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-6 py-4 font-mono text-xs text-zinc-900 dark:text-zinc-50">
                  {page.pagePath}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {page.crawlers.map((crawler) => (
                      <span
                        key={crawler}
                        className="inline-flex rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                      >
                        {crawler}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                  {page.crawlCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
