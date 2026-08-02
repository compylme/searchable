export const PLACEHOLDER_SITE_ID = "00000000-0000-4000-8000-000000000001";

export const KNOWN_BOT_UA =
  "Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)";

export const SEARCH_BOT_UA =
  "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)";

export const UNKNOWN_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const INVALID_PAYLOADS = {
  missingUrl: { site_id: PLACEHOLDER_SITE_ID },
  missingSiteId: { page_url: "https://example.com" },
  badUuid: { site_id: "not-a-uuid", page_url: "https://example.com" },
  badUrl: { site_id: PLACEHOLDER_SITE_ID, page_url: "not a url" },
  empty: {},
};

export const TEST_PAGE_URL = "https://test.example.com/blog/hello";
export const TEST_DOMAIN = "test.example.com";
export const TEST_USER_EMAIL = "track-test@example.com";
export const TEST_USER_PASSWORD = "test-password-123";

export const TRACK_ENDPOINT = "http://127.0.0.1:54321/functions/v1/track";
