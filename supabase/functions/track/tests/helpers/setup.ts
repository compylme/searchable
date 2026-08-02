import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  TEST_DOMAIN,
  TEST_USER_EMAIL,
  TEST_USER_PASSWORD,
  TRACK_ENDPOINT,
} from "./fixtures.ts";

export type SeedResult = {
  userId: string;
  siteId: string;
};

let cachedClient: SupabaseClient | null = null;

export function getTestEnv() {
  const url = Deno.env.get("SUPABASE_URL") ??
    Deno.env.get("API_URL") ??
    "http://127.0.0.1:54321";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SERVICE_ROLE_KEY");

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Run `supabase start` and export env via `eval $(supabase status -o env)`.",
    );
  }

  return { url, serviceRoleKey };
}

export function getTestClient(): SupabaseClient {
  if (cachedClient) return cachedClient;

  const { url, serviceRoleKey } = getTestEnv();
  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}

export async function seed(): Promise<SeedResult> {
  const client = getTestClient();

  const { data: existingUsers, error: listError } = await client.auth.admin
    .listUsers();
  if (listError) {
    throw new Error(`Failed to list users: ${listError.message}`);
  }

  let userId = existingUsers.users.find((user) =>
    user.email === TEST_USER_EMAIL
  )?.id;

  if (!userId) {
    const { data, error } = await client.auth.admin.createUser({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw new Error(`Failed to create test user: ${error?.message}`);
    }

    userId = data.user.id;
  }

  const { data: existingSite } = await client
    .from("sites")
    .select("id")
    .eq("user_id", userId)
    .eq("domain", TEST_DOMAIN)
    .maybeSingle();

  if (existingSite?.id) {
    return { userId, siteId: existingSite.id };
  }

  const { data: site, error: siteError } = await client
    .from("sites")
    .insert({ user_id: userId, domain: TEST_DOMAIN })
    .select("id")
    .single();

  if (siteError || !site) {
    throw new Error(`Failed to create test site: ${siteError?.message}`);
  }

  return { userId, siteId: site.id };
}

export async function clearCrawlerEvents(): Promise<void> {
  const client = getTestClient();
  const { error } = await client.from("crawler_events").delete().neq(
    "id",
    "00000000-0000-0000-0000-000000000000",
  );

  if (error) {
    throw new Error(`Failed to clear crawler_events: ${error.message}`);
  }
}

export async function teardown(): Promise<void> {
  const client = getTestClient();

  await clearCrawlerEvents();

  const { error: sitesError } = await client.from("sites").delete().neq(
    "id",
    "00000000-0000-0000-0000-000000000000",
  );
  if (sitesError) {
    throw new Error(`Failed to clear sites: ${sitesError.message}`);
  }

  const { data, error: listError } = await client.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list users during teardown: ${listError.message}`);
  }

  await Promise.all(
    data.users.map(async (user) => {
      const { error } = await client.auth.admin.deleteUser(user.id);
      if (error) {
        throw new Error(`Failed to delete user ${user.id}: ${error.message}`);
      }
    }),
  );
}

export async function countCrawlerEvents(siteId?: string): Promise<number> {
  const client = getTestClient();
  let query = client
    .from("crawler_events")
    .select("id", { count: "exact", head: true });

  if (siteId) {
    query = query.eq("site_id", siteId);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(`Failed to count crawler_events: ${error.message}`);
  }

  return count ?? 0;
}

export async function getLatestCrawlerEvent(siteId: string) {
  const client = getTestClient();
  const { data, error } = await client
    .from("crawler_events")
    .select("*")
    .eq("site_id", siteId)
    .order("received_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch crawler event: ${error.message}`);
  }

  return data;
}

/** Warm up the edge function to avoid cold-start flakes in E2E tests. */
export async function warmUpEndpoint(): Promise<void> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(TRACK_ENDPOINT, { method: "OPTIONS" });
      await response.body?.cancel();

      if (response.status === 204 || response.status === 200) {
        return;
      }
    } catch {
      // Retry until the function is reachable.
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 250));
  }

  throw new Error(
    `Edge function at ${TRACK_ENDPOINT} did not become ready after ${maxAttempts} attempts`,
  );
}
