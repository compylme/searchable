import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";
import { SitesList, type Site } from "./sites-list";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, created_at")
    .order("created_at", { ascending: true });

  const t = await getTranslations("Dashboard");

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {t("subtitle")}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {t("profile")}
          </h2>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("email")}
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("userId")}
              </dt>
              <dd className="mt-1 truncate font-mono text-sm text-zinc-900 dark:text-zinc-50">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {t("createdAt")}
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : t("emptyDate")}
              </dd>
            </div>
          </dl>
        </div>

        <SitesList
          initialSites={(sites ?? []) as Site[]}
          userId={user.id}
        />
      </div>
    </main>
  );
}
