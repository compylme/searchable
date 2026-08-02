import Link from "next/link";
import { getTranslations } from "next-intl/server";

type SiteActivityProps = {
  domain: string;
  siteId: string;
};

export async function SiteActivity({ domain, siteId }: SiteActivityProps) {
  const t = await getTranslations("SiteActivity");

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          {t("backToDashboard")}
        </Link>

        <div className="mt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {domain}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {siteId}
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("placeholder")}
          </p>
        </div>
      </div>
    </main>
  );
}
