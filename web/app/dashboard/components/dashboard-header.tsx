import { getTranslations } from "next-intl/server";
import { LayoutDashboard } from "lucide-react";
import { SignOutButton } from "./sign-out-button";

export async function DashboardHeader() {
  const t = await getTranslations("Dashboard");

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="inline-flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          <LayoutDashboard aria-hidden="true" className="h-5 w-5 shrink-0" />
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </div>
      <SignOutButton />
    </div>
  );
}
