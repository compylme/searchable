import { assertEquals, assertThrows } from "@std/assert";
import { parseBeaconRequest } from "../../validation/payload.ts";
import { RequestValidationError } from "../../utils/index.ts";
import { PLACEHOLDER_SITE_ID, TEST_PAGE_URL } from "../helpers/fixtures.ts";
import { buildBeaconRequest } from "../helpers/factories.ts";

Deno.test("parseBeaconRequest returns sid and Referer as payload", () => {
  const request = buildBeaconRequest(PLACEHOLDER_SITE_ID, {
    pageUrl: TEST_PAGE_URL,
  });

  const result = parseBeaconRequest(request);

  assertEquals(result, {
    site_id: PLACEHOLDER_SITE_ID,
    page_url: TEST_PAGE_URL,
  });
});

Deno.test("parseBeaconRequest rejects missing sid", () => {
  const request = buildBeaconRequest(PLACEHOLDER_SITE_ID, { sid: null });

  assertThrows(
    () => parseBeaconRequest(request),
    RequestValidationError,
    "sid is required",
  );
});

Deno.test("parseBeaconRequest rejects non-UUID sid", () => {
  const request = buildBeaconRequest(PLACEHOLDER_SITE_ID, {
    sid: "not-a-uuid",
  });

  assertThrows(
    () => parseBeaconRequest(request),
    RequestValidationError,
    "sid must be a valid UUID",
  );
});

Deno.test("parseBeaconRequest rejects missing Referer", () => {
  const request = buildBeaconRequest(PLACEHOLDER_SITE_ID, { pageUrl: null });

  assertThrows(
    () => parseBeaconRequest(request),
    RequestValidationError,
    "Referer is required",
  );
});

Deno.test("parseBeaconRequest rejects invalid Referer", () => {
  const request = buildBeaconRequest(PLACEHOLDER_SITE_ID, {
    pageUrl: "not a url",
  });

  assertThrows(
    () => parseBeaconRequest(request),
    RequestValidationError,
    "Referer must be a valid URL",
  );
});
