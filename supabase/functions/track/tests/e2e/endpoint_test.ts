import { assertEquals, assertExists } from "@std/assert";
import {
  KNOWN_BOT_UA,
  TEST_PAGE_URL,
  TRACK_ENDPOINT,
} from "../helpers/fixtures.ts";
import {
  clearCrawlerEvents,
  getLatestCrawlerEvent,
  getTestEnv,
  seed,
  teardown,
  warmUpEndpoint,
  type SeedResult,
} from "../helpers/setup.ts";

const env = getTestEnv();
Deno.env.set("SUPABASE_URL", env.url);
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", env.serviceRoleKey);

let seedData: SeedResult;

Deno.test({
  name: "endpoint e2e suite",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    seedData = await seed();
    await clearCrawlerEvents();
    await warmUpEndpoint();

    await t.step("OPTIONS returns 204 with CORS headers", async () => {
      const response = await fetch(TRACK_ENDPOINT, { method: "OPTIONS" });
      await response.body?.cancel();

      assertEquals(response.status, 204);
      assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
      assertEquals(
        response.headers.get("Access-Control-Allow-Methods"),
        "GET, OPTIONS",
      );
    });

    await t.step("POST returns 405 Method not allowed", async () => {
      const response = await fetch(TRACK_ENDPOINT, { method: "POST" });
      const body = await response.json();

      assertEquals(response.status, 405);
      assertEquals(body.error, "Method not allowed");
      assertEquals(response.headers.get("Content-Type"), "application/json");
    });

    await t.step(
      "GET with sid and Referer returns 200 JS and persists event",
      async () => {
        await clearCrawlerEvents();

        const url = `${TRACK_ENDPOINT}?sid=${encodeURIComponent(seedData.siteId)}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "user-agent": KNOWN_BOT_UA,
            referer: TEST_PAGE_URL,
          },
        });
        const body = await response.text();

        assertEquals(response.status, 200);
        assertEquals(
          response.headers.get("Content-Type")?.startsWith(
            "application/javascript",
          ),
          true,
        );
        assertEquals(body, "void 0;");

        const event = await getLatestCrawlerEvent(seedData.siteId);
        assertExists(event);
        assertEquals(event.bot_name, "GPTBot");
        assertEquals(event.site_id, seedData.siteId);
        assertEquals(event.page_url, TEST_PAGE_URL);
      },
    );

    await teardown(seedData);
  },
});
