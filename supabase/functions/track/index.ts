import { createClient } from "@supabase/supabase-js"
import type { BotClassification, TrackingPayload } from "./types/index.ts"
import { BOT_DEFINITIONS } from "./definitions/bots.ts"
import { jsonResponse, RequestValidationError, requireEnvironmentVariable } from "./utils/index.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS"){
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  if(request.method !== "POST"){
    return jsonResponse({ error: "Method not allowed"}, 405)
  }

  const requestId = crypto.randomUUID()

  try{
    const payload = await parsePayload(request);

    validatePayload(payload);

    const userAgent = request.headers.get("user-agent") ?? "unknown";

    const classification = classifyCrawler(userAgent)
    const pageUrl = new URL(payload.page_url);

    const crawlerEvent = {
      site_id: payload.site_id,
      user_agent: userAgent,
      page_url: pageUrl.href,
      page_path: pageUrl.pathname,
      received_at: new Date().toISOString(),
      bot_name: classification.bot_name,
      platform: classification.platform,
      bot_type: classification.bot_type,
    };

    const supabase = createClient(
      requireEnvironmentVariable("SUPABASE_URL"),
      requireEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY'),
    );

    const { error } = await supabase
      .from("crawler_events")
      .insert(crawlerEvent)

    
    if (error) {
      console.error("Crawler event insert failed", {
        requestId,
        siteId: payload.site_id,
        error: error.message,
      });

      return jsonResponse({ error: "Unable to record event" }, 500);
    }

    return jsonResponse({ accepted: true }, 202);
  } catch (error) {
    if (error instanceof RequestValidationError) {
      console.warn("Invalid tracking request", {
        requestId,
        error: error.message,
      });

      return jsonResponse({ error: error.message }, 400);
    }

    console.error("Unexpected tracking error", {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse({ error: "Internal server error" }, 500);
  }
});

async function parsePayload(request: Request): Promise<TrackingPayload> {
  try {
    return await request.json();
  } catch {
    throw new RequestValidationError("Request body must be valid JSON")
  }
}

function validatePayload(
  payload: TrackingPayload,
): asserts payload is TrackingPayload{
  if (!payload || typeof payload !== "object") {
    throw new RequestValidationError("Invalid request body")
  }

  if (!payload.site_id || typeof payload.site_id !== "string") {
    throw new RequestValidationError("site_id is required");
  }

  if (!payload.page_url || typeof payload.page_url !== "string") {
    throw new RequestValidationError("page_url is required");
  }

  try {
    new URL(payload.page_url);
  } catch {
    throw new RequestValidationError("page_url must be a valid URL")
  }
}

function classifyCrawler(userAgent: string): BotClassification {
  const normalizedUserAgent = userAgent.toLowerCase();

  const match = BOT_DEFINITIONS.find(({ userAgentPattern }) =>
    normalizedUserAgent.includes(userAgentPattern)
  );

  if (!match) {
    return {
      bot_name: null,
      platform: null,
      bot_type: "unknown",
    };
  }

  return {
    bot_name: match.botName,
    platform: match.platform,
    bot_type: match.botType,
  };
}