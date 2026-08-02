import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { parsePayload, validatePayload } from "../../validation/payload.ts";
import { RequestValidationError } from "../../utils/index.ts";
import { INVALID_PAYLOADS, PLACEHOLDER_SITE_ID } from "../helpers/fixtures.ts";
import { buildRequest } from "../helpers/factories.ts";

Deno.test("parsePayload returns parsed JSON body", async () => {
  const payload = {
    site_id: PLACEHOLDER_SITE_ID,
    page_url: "https://example.com",
  };
  const request = buildRequest(payload);

  const result = await parsePayload(request);

  assertEquals(result, payload);
});

Deno.test("parsePayload throws for invalid JSON", async () => {
  const request = buildRequest("{ not-json", {
    headers: { "content-type": "application/json" },
  });

  await assertRejects(
    () => parsePayload(request),
    RequestValidationError,
    "Request body must be valid JSON",
  );
});

Deno.test("parsePayload throws for empty body", async () => {
  const request = new Request("http://localhost/track", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "",
  });

  await assertRejects(
    () => parsePayload(request),
    RequestValidationError,
    "Request body must be valid JSON",
  );
});

Deno.test("validatePayload accepts a valid payload", () => {
  const payload = {
    site_id: PLACEHOLDER_SITE_ID,
    page_url: "https://example.com/path",
  };

  validatePayload(payload);
});

Deno.test("validatePayload rejects missing site_id", () => {
  assertThrows(
    () => validatePayload(INVALID_PAYLOADS.missingSiteId as never),
    RequestValidationError,
    "site_id is required",
  );
});

Deno.test("validatePayload rejects non-UUID site_id", () => {
  assertThrows(
    () => validatePayload(INVALID_PAYLOADS.badUuid as never),
    RequestValidationError,
    "site_id must be a valid UUID",
  );
});

Deno.test("validatePayload rejects missing page_url", () => {
  assertThrows(
    () => validatePayload(INVALID_PAYLOADS.missingUrl as never),
    RequestValidationError,
    "page_url is required",
  );
});

Deno.test("validatePayload rejects invalid page_url", () => {
  assertThrows(
    () => validatePayload(INVALID_PAYLOADS.badUrl as never),
    RequestValidationError,
    "page_url must be a valid URL",
  );
});

Deno.test("validatePayload rejects null/non-object body", () => {
  assertThrows(
    () => validatePayload(null as never),
    RequestValidationError,
    "Invalid request body",
  );
});
