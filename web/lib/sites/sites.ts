import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateSiteResult, Site } from "./types";

const SITE_COLUMNS = "id, domain, created_at" as const;

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
  const normalizedDomain = domain.trim().toLowerCase();

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
