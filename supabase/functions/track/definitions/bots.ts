import type { BotDefinition } from "../types/index.ts"

export const BOT_DEFINITIONS: BotDefinition[] = [
  {
    userAgentPattern: "gptbot",
    botName: "GPTBot",
    platform: "OpenAI",
    botType: "training",
    purpose: "AI Training & Search",
  },
  {
    userAgentPattern: "chatgpt-user",
    botName: "ChatGPT-User",
    platform: "OpenAI",
    botType: "assistant",
    purpose: "Real-time browsing",
  },
  {
    userAgentPattern: "oai-searchbot",
    botName: "OAI-SearchBot",
    platform: "OpenAI",
    botType: "search",
    purpose: "AI search",
  },
  {
    userAgentPattern: "claudebot",
    botName: "ClaudeBot",
    platform: "Anthropic",
    botType: "training",
    purpose: "AI training",
  },
  {
    userAgentPattern: "google-extended",
    botName: "Google-Extended",
    platform: "Google",
    botType: "training",
    purpose: "Gemini training",
  },
  {
    userAgentPattern: "perplexitybot",
    botName: "PerplexityBot",
    platform: "Perplexity",
    botType: "search",
    purpose: "AI search",
  },
  {
    userAgentPattern: "meta-externalagent",
    botName: "Meta-ExternalAgent",
    platform: "Meta",
    botType: "training",
    purpose: "AI training",
  },
  {
    userAgentPattern: "applebot-extended",
    botName: "Applebot-Extended",
    platform: "Apple",
    botType: "assistant",
    purpose: "AI features",
  },
  {
    userAgentPattern: "ccbot",
    botName: "CCBot",
    platform: "Common Crawl",
    botType: "dataset",
    purpose: "Dataset building",
  },
  {
    userAgentPattern: "bytespider",
    botName: "Bytespider",
    platform: "ByteDance",
    botType: "training",
    purpose: "AI training",
  },
];
