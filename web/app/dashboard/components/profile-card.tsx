import { getTranslations } from "next-intl/server";

type ProfileCardProps = {
  email: string | undefined;
  userId: string;
  createdAt: string | undefined;
};

export async function ProfileCard({
  email,
  userId,
  createdAt,
}: ProfileCardProps) {
  const t = await getTranslations("Dashboard");

  return (
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
            {email}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t("userId")}
          </dt>
          <dd className="mt-1 truncate font-mono text-sm text-zinc-900 dark:text-zinc-50">
            {userId}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {t("createdAt")}
          </dt>
          <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
            {createdAt ? new Date(createdAt).toLocaleString() : t("emptyDate")}
          </dd>
        </div>
      </dl>
    </div>
  );
}
