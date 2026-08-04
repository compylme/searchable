import { KNOWN_BOT_UA, TEST_PAGE_URL } from "./fixtures.ts";

type BeaconOptions = {
  pageUrl?: string | null;
  userAgent?: string | null;
  sid?: string | null;
  method?: string;
  headers?: HeadersInit;
};

/** Build a GET beacon request: /track?sid=… with Referer + User-Agent. */
export function buildBeaconRequest(
  siteId: string,
  options: BeaconOptions = {},
): Request {
  const {
    pageUrl = TEST_PAGE_URL,
    userAgent = KNOWN_BOT_UA,
    sid = siteId,
    method = "GET",
    headers = {},
  } = options;

  const url = new URL("http://localhost/track");
  if (sid !== null) {
    url.searchParams.set("sid", sid);
  }

  const requestHeaders = new Headers(headers);

  if (userAgent === null) {
    requestHeaders.delete("user-agent");
  } else {
    requestHeaders.set("user-agent", userAgent);
  }

  if (pageUrl === null) {
    requestHeaders.delete("referer");
  } else {
    requestHeaders.set("referer", pageUrl);
  }

  return new Request(url, {
    method,
    headers: requestHeaders,
  });
}
