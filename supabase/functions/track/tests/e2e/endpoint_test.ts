import { assertEquals, assertExists } from "@std/assert";
import { buildPayload } from "../helpers/factories.ts";
import {
  KNOWN_BOT_UA,
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
        "POST, OPTIONS",
      );
    });

    await t.step("GET returns 405 Method not allowed", async () => {
      const response = await fetch(TRACK_ENDPOINT, { method: "GET" });
      const body = await response.json();

      assertEquals(response.status, 405);
      assertEquals(body.error, "Method not allowed");
      assertEquals(response.headers.get("Content-Type"), "application/json");
    });

    await t.step(
      "POST with valid payload returns 202 and persists event",
      async () => {
        await clearCrawlerEvents();

        const payload = buildPayload(seedData.siteId);
        const response = await fetch(TRACK_ENDPOINT, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "user-agent": KNOWN_BOT_UA,
          },
          body: JSON.stringify(payload),
        });
        const body = await response.json();

        assertEquals(response.status, 202);
        assertEquals(body, { accepted: true });
        assertEquals(response.headers.get("Content-Type"), "application/json");

        const event = await getLatestCrawlerEvent(seedData.siteId);
        assertExists(event);
        assertEquals(event.bot_name, "GPTBot");
        assertEquals(event.site_id, seedData.siteId);
      },
    );

    await t.step("POST with invalid JSON returns 400", async () => {
      const response = await fetch(TRACK_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": KNOWN_BOT_UA,
        },
        body: "{ not-json",
      });
      const body = await response.json();

      assertEquals(response.status, 400);
      assertEquals(body.error, "Request body must be valid JSON");
      assertEquals(response.headers.get("Content-Type"), "application/json");
    });

    await teardown();
  },
});
