import type { TrackingPayload } from "../../types/index.ts";
import { KNOWN_BOT_UA, TEST_PAGE_URL } from "./fixtures.ts";

export function buildPayload(
  siteId: string,
  overrides: Partial<TrackingPayload> = {},
): TrackingPayload {
  return {
    site_id: siteId,
    page_url: TEST_PAGE_URL,
    ...overrides,
  };
}

export function buildRequest(
  body: unknown,
  options: {
    method?: string;
    headers?: HeadersInit;
    userAgent?: string | null;
  } = {},
): Request {
  const { method = "POST", headers = {}, userAgent = KNOWN_BOT_UA } = options;

  const requestHeaders = new Headers({
    "content-type": "application/json",
    ...headers,
  });

  if (userAgent === null) {
    requestHeaders.delete("user-agent");
  } else {
    requestHeaders.set("user-agent", userAgent);
  }

  return new Request("http://localhost/track", {
    method,
    headers: requestHeaders,
    body: method === "GET" || method === "OPTIONS"
      ? undefined
      : typeof body === "string"
      ? body
      : JSON.stringify(body),
  });
}
