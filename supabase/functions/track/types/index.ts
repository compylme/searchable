export type TrackingPayload = {
  site_id: string;
  page_url: string;
};

export type BotType = "training" | "search" | "assistant" | "dataset" | "unknown";

export type BotDefinition = {
  userAgentPattern: string;
  botName: string;
  platform: string;
  botType: BotType;
  purpose: string;
};

export type BotClassification = {
  bot_name: string | null;
  platform: string | null;
  bot_type: BotType;
};
