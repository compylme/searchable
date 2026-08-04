import { assertEquals, assertExists } from "@std/assert";
import { handleRequest } from "../../handler.ts";
import { buildBeaconRequest } from "../helpers/factories.ts";
import {
  KNOWN_BOT_UA,
  PLACEHOLDER_SITE_ID,
  TEST_PAGE_URL,
} from "../helpers/fixtures.ts";
import {
  clearCrawlerEvents,
  countCrawlerEvents,
  getLatestCrawlerEvent,
  getTestClient,
  getTestEnv,
  seed,
  teardown,
  type SeedResult,
} from "../helpers/setup.ts";

const env = getTestEnv();
Deno.env.set("SUPABASE_URL", env.url);
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", env.serviceRoleKey);

let seedData: SeedResult;

Deno.test({
  name: "handler integration suite",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn(t) {
    seedData = await seed();
    await clearCrawlerEvents();

    await t.step(
      "valid GET with known bot UA returns 200 JS and inserts classified row",
      async () => {
        await clearCrawlerEvents();

        const request = buildBeaconRequest(seedData.siteId, {
          userAgent: KNOWN_BOT_UA,
        });
        const response = await handleRequest(request);
        const body = await response.text();

        assertEquals(response.status, 200);
        assertEquals(
          response.headers.get("Content-Type"),
          "application/javascript",
        );
        assertEquals(body, "void 0;");

        const event = await getLatestCrawlerEvent(seedData.siteId);
        assertExists(event);
        assertEquals(event.bot_name, "GPTBot");
        assertEquals(event.platform, "OpenAI");
        assertEquals(event.bot_type, "training");
        assertEquals(event.user_agent, KNOWN_BOT_UA);
        assertEquals(event.page_url, TEST_PAGE_URL);
      },
    );

    await t.step(
      "invalid sid returns 400 and does not insert",
      async () => {
        await clearCrawlerEvents();

        const request = buildBeaconRequest(seedData.siteId, {
          sid: "not-a-uuid",
        });
        const response = await handleRequest(request);
        const body = await response.json();

        assertEquals(response.status, 400);
        assertEquals(body.error, "sid must be a valid UUID");
        assertEquals(await countCrawlerEvents(), 0);
      },
    );

    await t.step(
      "missing Referer returns 400 and does not insert",
      async () => {
        await clearCrawlerEvents();

        const request = buildBeaconRequest(seedData.siteId, {
          pageUrl: null,
        });
        const response = await handleRequest(request);
        const body = await response.json();

        assertEquals(response.status, 400);
        assertEquals(body.error, "Referer is required");
        assertEquals(await countCrawlerEvents(), 0);
      },
    );

    await t.step(
      "FK violation for unknown site_id returns 500 Unable to record event",
      async () => {
        await clearCrawlerEvents();

        const request = buildBeaconRequest(PLACEHOLDER_SITE_ID);
        const response = await handleRequest(request);
        const body = await response.json();

        assertEquals(response.status, 500);
        assertEquals(body.error, "Unable to record event");
        assertEquals(await countCrawlerEvents(), 0);
      },
    );

    await t.step("page_path is extracted from Referer", async () => {
      await clearCrawlerEvents();

      const pageUrl = "https://test.example.com/docs/getting-started?ref=1";
      const request = buildBeaconRequest(seedData.siteId, { pageUrl });
      const response = await handleRequest(request);

      assertEquals(response.status, 200);

      const event = await getLatestCrawlerEvent(seedData.siteId);
      assertExists(event);
      assertEquals(event.page_path, "/docs/getting-started");
      assertEquals(event.page_url, pageUrl);
    });

    await t.step("user_agent longer than 500 chars is truncated", async () => {
      await clearCrawlerEvents();

      const longUa = `${"a".repeat(600)} GPTBot`;
      const request = buildBeaconRequest(seedData.siteId, {
        userAgent: longUa,
      });
      const response = await handleRequest(request);

      assertEquals(response.status, 200);

      const event = await getLatestCrawlerEvent(seedData.siteId);
      assertExists(event);
      assertEquals(event.user_agent.length, 500);
      assertEquals(event.user_agent, longUa.slice(0, 500));
    });

    await t.step(
      "bot_type check constraint rejects invalid values at DB boundary",
      async () => {
        const client = getTestClient();
        const { error } = await client.from("crawler_events").insert({
          site_id: seedData.siteId,
          user_agent: "test-agent",
          page_url: "https://test.example.com/constraint",
          page_path: "/constraint",
          bot_type: "not-a-valid-type",
        });

        assertExists(error);
        assertEquals(
          error.message.toLowerCase().includes("valid_bot_type") ||
            error.message.toLowerCase().includes("check") ||
            error.code === "23514",
          true,
        );
      },
    );

    await teardown(seedData);
  },
});
