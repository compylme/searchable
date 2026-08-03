import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function LandingHero() {
  const t = await getTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-base text-zinc-500">
        {t("subtitle")}
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-hover"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
