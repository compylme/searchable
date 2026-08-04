import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateSiteResult, Site } from "./types";

const SITE_COLUMNS = "id, domain, created_at" as const;
const DOMAIN_RE =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
  
export function normalizeDomain(input: string): string | null {
  const hostname = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split(/[/?#]/)[0];

  return hostname && DOMAIN_RE.test(hostname) ? hostname : null;
}

export async function listSites(supabase: SupabaseClient): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to list sites: ${error.message}`);
  }

  return (data ?? []) as Site[];
}

export async function getSite(
  supabase: SupabaseClient,
  siteId: string,
): Promise<Site | null> {
  const { data, error } = await supabase
    .from("sites")
    .select(SITE_COLUMNS)
    .eq("id", siteId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load site: ${error.message}`);
  }

  return (data as Site | null) ?? null;
}

export async function createSite(
  supabase: SupabaseClient,
  userId: string,
  domain: string,
): Promise<CreateSiteResult> {
  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return {
      error: {
        code: "invalid_domain",
        message: "Enter a valid domain or URL.",
      },
    };
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({ domain: normalizedDomain, user_id: userId })
    .select(SITE_COLUMNS)
    .single();

  if (error) {
    return {
      error: {
        code: error.code,
        message: error.message,
      },
    };
  }

  return { site: data as Site };
}
