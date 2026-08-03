import { assertEquals } from "@std/assert";
import { classifyCrawler } from "../../classification/index.ts";
import {
  KNOWN_BOT_UA,
  SEARCH_BOT_UA,
  UNKNOWN_UA,
} from "../helpers/fixtures.ts";

Deno.test("classifyCrawler matches GPTBot as training bot", () => {
  const result = classifyCrawler(KNOWN_BOT_UA);

  assertEquals(result, {
    bot_name: "GPTBot",
    platform: "OpenAI",
    bot_type: "training",
  });
});

Deno.test("classifyCrawler matches PerplexityBot as search bot", () => {
  const result = classifyCrawler(SEARCH_BOT_UA);

  assertEquals(result, {
    bot_name: "PerplexityBot",
    platform: "Perplexity",
    bot_type: "search",
  });
});

Deno.test("classifyCrawler returns unknown for unrecognized UA", () => {
  const result = classifyCrawler(UNKNOWN_UA);

  assertEquals(result, {
    bot_name: null,
    platform: null,
    bot_type: "unknown",
  });
});
