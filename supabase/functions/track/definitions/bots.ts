import type { BotDefinition } from "../types/index.ts"

export const BOT_DEFINITIONS: BotDefinition[] = [
  {
    userAgentPattern: "gpt[_-]?bot",
    botName: "GPTBot",
    platform: "OpenAI",
    botType: "training",
    purpose: "AI Training & Search",
  },
  {
    userAgentPattern: "chatgpt[_-]?user",
    botName: "ChatGPT-User",
    platform: "OpenAI",
    botType: "assistant",
    purpose: "Real-time browsing",
  },
  {
    userAgentPattern: "oai[_-]?searchbot",
    botName: "OAI-SearchBot",
    platform: "OpenAI",
    botType: "search",
    purpose: "AI search",
  },
  {
    userAgentPattern: "claude[_-]?bot",
    botName: "ClaudeBot",
    platform: "Anthropic",
    botType: "training",
    purpose: "AI training",
  },
  {
    userAgentPattern: "google[_-]?extended|googleother",
    botName: "Google-Extended",
    platform: "Google",
    botType: "training",
    purpose: "Gemini training",
  },
  {
    userAgentPattern: "perplexity[_-]?bot",
    botName: "PerplexityBot",
    platform: "Perplexity",
    botType: "search",
    purpose: "AI search",
  },
  {
    userAgentPattern: "meta[_-]?external(agent|fetcher)",
    botName: "Meta-ExternalAgent",
    platform: "Meta",
    botType: "training",
    purpose: "AI training",
  },
  {
    userAgentPattern: "applebot[_-]extended",
    botName: "Applebot-Extended",
    platform: "Apple",
    botType: "assistant",
    purpose: "AI features",
  },
  {
    userAgentPattern: "ccbot|commoncrawl",
    botName: "CCBot",
    platform: "Common Crawl",
    botType: "dataset",
    purpose: "Dataset building",
  },
  {
    userAgentPattern: "bytespider|bytedance",
    botName: "Bytespider",
    platform: "ByteDance",
    botType: "training",
    purpose: "AI training",
  },
];
