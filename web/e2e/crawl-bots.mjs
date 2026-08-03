/**
 * Simulate AI bot crawls by POSTing tracking events with spoofed User-Agents.
 *
 * Usage:
 *   npm run crawl:bots
 *   npm run crawl:bots -- --bots=GPTBot,ClaudeBot
 *   npm run crawl:bots -- --prod --site-id=<uuid>
 *   npm run crawl:bots -- --endpoint=<url> --site-id=<uuid>
 */

const PROD_ENDPOINT =
  "https://trkaijnxdulrvtgcvddn.supabase.co/functions/v1/track";
const LOCAL_ENDPOINT = "http://127.0.0.1:54321/functions/v1/track";
const LOCAL_SITE_ID = "b1000000-0000-4000-8000-000000000001";

const BOTS = {
  GPTBot: "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
  ClaudeBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  PerplexityBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  CCBot: "CCBot/2.0 (+https://commoncrawl.org/faq/)",
};

const PAGES = ["/", "/about"];

function parseArgs(argv) {
  const args = {
    bots: Object.keys(BOTS),
    prod: false,
    siteId: null,
    endpoint: null,
  };

  for (const arg of argv) {
    if (arg === "--prod") {
      args.prod = true;
    } else if (arg.startsWith("--bots=")) {
      args.bots = arg
        .slice("--bots=".length)
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    } else if (arg.startsWith("--site-id=")) {
      args.siteId = arg.slice("--site-id=".length).trim();
    } else if (arg.startsWith("--endpoint=")) {
      args.endpoint = arg.slice("--endpoint=".length).trim();
    }
  }

  return args;
}

async function sendEvent(endpoint, siteId, userAgent, pagePath) {
  const payload = {
    site_id: siteId,
    page_url: `https://example.com${pagePath}`,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify(payload),
  });

  return response;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.prod && !args.siteId) {
    console.error("--prod requires --site-id=<uuid>");
    process.exit(1);
  }

  for (const botName of args.bots) {
    if (!BOTS[botName]) {
      console.error(
        `Unknown bot "${botName}". Available: ${Object.keys(BOTS).join(", ")}`,
      );
      process.exit(1);
    }
  }

  const siteId = args.siteId || LOCAL_SITE_ID;
  const endpoint =
    args.endpoint || (args.prod ? PROD_ENDPOINT : LOCAL_ENDPOINT);

  console.log(`Target: ${args.prod ? "PRODUCTION" : "local"}`);
  console.log(`Endpoint: ${endpoint}`);
  console.log(`Site ID: ${siteId}`);

  for (const botName of args.bots) {
    const userAgent = BOTS[botName];
    console.log(`\n→ ${botName}`);

    for (const pagePath of PAGES) {
      const response = await sendEvent(endpoint, siteId, userAgent, pagePath);
      const body = await response.text();
      console.log(`  ${pagePath} → ${response.status} ${body}`);
    }
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
