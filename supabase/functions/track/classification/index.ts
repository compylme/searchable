import type { BotClassification } from "../types/index.ts"
import { BOT_DEFINITIONS } from "../definitions/bots.ts"

const COMPILED_DEFINITIONS = BOT_DEFINITIONS.map((def) => ({
  ...def,
  pattern: new RegExp(def.userAgentPattern, "i"),
}));

export function classifyCrawler(userAgent: string): BotClassification {
  const match = COMPILED_DEFINITIONS.find(({ pattern }) =>
    pattern.test(userAgent)
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
