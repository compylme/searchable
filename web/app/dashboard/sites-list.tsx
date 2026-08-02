"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type SubmitEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export type Site = {
  id: string;
  domain: string;
  created_at: string;
};

type SitesListProps = {
  initialSites: Site[];
  userId: string;
};

export function SitesList({ initialSites, userId }: SitesListProps) {
  const router = useRouter();
  const [sites, setSites] = useState(initialSites);
  const [adding, setAdding] = useState(false);
  const [domain, setDomain] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleCreate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter a domain.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("sites")
      .insert({ domain: trimmed, user_id: userId })
      .select("id, domain, created_at")
      .single();

    setSaving(false);

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "You already have a site with that domain."
          : insertError.message,
      );
      return;
    }

    if (data) {
      setSites((prev) => [...prev, data]);
    }
    setDomain("");
    setAdding(false);
    router.refresh();
  }

  function cancelAdd() {
    setAdding(false);
    setDomain("");
    setError(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Sites
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-6 py-3 font-medium">Site name</th>
              <th className="px-6 py-3 font-medium">Tracking ID</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Activity</th>
            </tr>
          </thead>
          <tbody>
            {sites.length === 0 && !adding && (
              <tr className="border-b border-zinc-100 dark:border-zinc-800">
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-zinc-500 dark:text-zinc-400"
                >
                  No sites yet. Add your first site below.
                </td>
              </tr>
            )}

            {sites.map((site) => (
              <tr
                key={site.id}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-50">
                  {site.domain}
                </td>
                <td className="px-6 py-4 font-mono text-xs text-zinc-600 dark:text-zinc-300">
                  {site.id}
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">
                  {new Date(site.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/dashboard/sites/${site.id}`}
                    className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
                  >
                    View activity
                  </Link>
                </td>
              </tr>
            ))}

            <tr>
              <td colSpan={4} className="px-6 py-4">
                {adding ? (
                  <form onSubmit={handleCreate} className="space-y-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="flex-1">
                        <label
                          htmlFor="domain"
                          className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
                        >
                          Domain
                        </label>
                        <input
                          id="domain"
                          type="text"
                          autoFocus
                          required
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          placeholder="example.com"
                          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          {saving ? "Creating…" : "Create site"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelAdd}
                          disabled={saving}
                          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    {error && (
                      <p
                        role="alert"
                        className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
                      >
                        {error}
                      </p>
                    )}
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="w-full rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                  >
                    + Add a new site
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
