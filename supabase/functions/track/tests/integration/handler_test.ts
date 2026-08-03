import { assertEquals, assertExists } from "@std/assert";
import { handleRequest } from "../../handler.ts";
import { buildPayload, buildRequest } from "../helpers/factories.ts";
import {
  KNOWN_BOT_UA,
  PLACEHOLDER_SITE_ID,
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
      "valid POST with known bot UA returns 202 and inserts classified row",
      async () => {
        await clearCrawlerEvents();

        const payload = buildPayload(seedData.siteId);
        const request = buildRequest(payload, { userAgent: KNOWN_BOT_UA });
        const response = await handleRequest(request);
        const body = await response.json();

        assertEquals(response.status, 202);
        assertEquals(body, { accepted: true });

        const event = await getLatestCrawlerEvent(seedData.siteId);
        assertExists(event);
        assertEquals(event.bot_name, "GPTBot");
        assertEquals(event.platform, "OpenAI");
        assertEquals(event.bot_type, "training");
        assertEquals(event.user_agent, KNOWN_BOT_UA);
      },
    );

    await t.step(
      "invalid payload returns 400 and does not insert",
      async () => {
        await clearCrawlerEvents();

        const request = buildRequest({
          site_id: "not-a-uuid",
          page_url: "https://example.com",
        });
        const response = await handleRequest(request);
        const body = await response.json();

        assertEquals(response.status, 400);
        assertEquals(body.error, "site_id must be a valid UUID");
        assertEquals(await countCrawlerEvents(), 0);
      },
    );

    await t.step(
      "FK violation for unknown site_id returns 500 Unable to record event",
      async () => {
        await clearCrawlerEvents();

        const request = buildRequest(buildPayload(PLACEHOLDER_SITE_ID));
        const response = await handleRequest(request);
        const body = await response.json();

        assertEquals(response.status, 500);
        assertEquals(body.error, "Unable to record event");
        assertEquals(await countCrawlerEvents(), 0);
      },
    );

    await t.step("page_path is extracted from page_url", async () => {
      await clearCrawlerEvents();

      const payload = buildPayload(seedData.siteId, {
        page_url: "https://test.example.com/docs/getting-started?ref=1",
      });
      const request = buildRequest(payload);
      const response = await handleRequest(request);

      assertEquals(response.status, 202);

      const event = await getLatestCrawlerEvent(seedData.siteId);
      assertExists(event);
      assertEquals(event.page_path, "/docs/getting-started");
      assertEquals(
        event.page_url,
        "https://test.example.com/docs/getting-started?ref=1",
      );
    });

    await t.step("user_agent longer than 500 chars is truncated", async () => {
      await clearCrawlerEvents();

      const longUa = `${"a".repeat(600)} GPTBot`;
      const request = buildRequest(buildPayload(seedData.siteId), {
        userAgent: longUa,
      });
      const response = await handleRequest(request);

      assertEquals(response.status, 202);

      const event = await getLatestCrawlerEvent(seedData.siteId);
      assertExists(event);
      assertEquals(event.user_agent.length, 500);
      assertEquals(event.user_agent, longUa.slice(0, 500));
    });

    await t.step(
      "client timestamp is ignored; received_at is server-set",
      async () => {
        await clearCrawlerEvents();

        const clientTimestamp = "2000-01-01T00:00:00.000Z";
        const before = Date.now();

        const request = buildRequest(
          buildPayload(seedData.siteId, { timestamp: clientTimestamp }),
        );
        const response = await handleRequest(request);
        const after = Date.now();

        assertEquals(response.status, 202);

        const event = await getLatestCrawlerEvent(seedData.siteId);
        assertExists(event);

        const receivedAt = new Date(event.received_at).getTime();
        assertEquals(receivedAt >= before - 1000, true);
        assertEquals(receivedAt <= after + 1000, true);
        assertEquals(event.received_at.includes("2000-01-01"), false);
      },
    );

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
