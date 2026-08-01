import type { BotClassification } from "../types/index.ts"
import { BOT_DEFINITIONS } from "../definitions/bots.ts"

export function classifyCrawler(userAgent: string): BotClassification {
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
