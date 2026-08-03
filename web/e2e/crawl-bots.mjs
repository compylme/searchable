/**
 * Manual bot-crawl helper.
 *
 * Serves the fixture test site, opens a headed Chromium window for each
 * spoofed AI crawler User-Agent, hits Home + About (tracker fires on load),
 * then opens the dashboard so you can inspect the new events.
 *
 * Prereqs:
 *   - `supabase start` (track endpoint at http://127.0.0.1:54321)
 *   - `npm run dev` in another terminal (dashboard at http://localhost:3000)
 *   - seed data present (demo@searchable.dev / demo-password-123)
 *
 * Usage:
 *   npm run crawl:bots
 *   npm run crawl:bots -- --bots=GPTBot,ClaudeBot
 *   npm run crawl:bots -- --keep-open
 */

import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const testSiteDir = path.join(__dirname, "fixtures/test-site");
const trackerSrc = path.join(repoRoot, "public/tracker.js");
const trackerDest = path.join(testSiteDir, "tracker.js");

const TEST_SITE = "http://localhost:4001";
const DASHBOARD =
  "http://localhost:3000/dashboard/sites/b1000000-0000-4000-8000-000000000001";
const TRACK_PATH = "/functions/v1/track";

const BOTS = {
  GPTBot: "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)",
  ClaudeBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
  PerplexityBot:
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
  CCBot: "CCBot/2.0 (+https://commoncrawl.org/faq/)",
};

function parseArgs(argv) {
  const args = {
    bots: Object.keys(BOTS),
    keepOpen: false,
    pages: ["/", "/about.html"],
  };

  for (const arg of argv) {
    if (arg === "--keep-open") {
      args.keepOpen = true;
    } else if (arg.startsWith("--bots=")) {
      args.bots = arg
        .slice("--bots=".length)
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
    }
  }

  return args;
}

async function waitForUrl(url, timeoutMs = 30_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function startTestSiteServer() {
  return spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["serve", testSiteDir, "-l", "4001", "--no-clipboard"],
    {
      cwd: path.join(__dirname, ".."),
      stdio: "ignore",
    },
  );
}

async function crawlAsBot(browser, botName, userAgent, pages) {
  const context = await browser.newContext({ userAgent });
  const page = await context.newPage();

  console.log(`\n→ Crawling as ${botName}`);
  console.log(`  UA: ${userAgent}`);

  for (const pagePath of pages) {
    const trackPromise = page.waitForResponse(
      (response) =>
        response.url().includes(TRACK_PATH) &&
        response.request().method() === "POST",
      { timeout: 15_000 },
    );

    const url = `${TEST_SITE}${pagePath}`;
    await page.goto(url, { waitUntil: "networkidle" });
    const trackResponse = await trackPromise;
    console.log(
      `  ${pagePath} → track ${trackResponse.status()} (${trackResponse.url()})`,
    );
  }

  await context.close();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  for (const botName of args.bots) {
    if (!BOTS[botName]) {
      console.error(
        `Unknown bot "${botName}". Available: ${Object.keys(BOTS).join(", ")}`,
      );
      process.exit(1);
    }
  }

  fs.copyFileSync(trackerSrc, trackerDest);
  console.log("Synced public/tracker.js → e2e/fixtures/test-site/tracker.js");

  const server = startTestSiteServer();
  let browser;

  try {
    await waitForUrl(`${TEST_SITE}/tracker.js`);
    console.log(`Test site ready at ${TEST_SITE}`);

    browser = await chromium.launch({ headless: false, slowMo: 400 });

    for (const botName of args.bots) {
      await crawlAsBot(browser, botName, BOTS[botName], args.pages);
    }

    console.log("\nOpening site activity dashboard for inspection…");
    console.log(
      "Login if needed: demo@searchable.dev / demo-password-123",
    );
    console.log(`Dashboard: ${DASHBOARD}`);

    const inspect = await browser.newContext();
    const page = await inspect.newPage();
    await page.goto(DASHBOARD, { waitUntil: "domcontentloaded" });

    if (args.keepOpen) {
      console.log("\n--keep-open: browser will stay open. Press Ctrl+C to exit.");
      await new Promise(() => {});
    } else {
      console.log(
        "\nBrowser stays open for 60s so you can inspect. Re-run with --keep-open to wait indefinitely.",
      );
      await new Promise((r) => setTimeout(r, 60_000));
    }
  } finally {
    await browser?.close().catch(() => {});
    server.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
