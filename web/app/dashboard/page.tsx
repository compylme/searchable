import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 flex-col px-4 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your Searchable profile
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Profile
          </h2>
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {user.email}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                User ID
              </dt>
              <dd className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-50">
                {user.id}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Created at
              </dt>
              <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-50">
                {user.created_at
                  ? new Date(user.created_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
