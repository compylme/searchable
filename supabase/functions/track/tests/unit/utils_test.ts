import { assertEquals, assertThrows } from "@std/assert";
import {
  corsHeaders,
  jsonResponse,
  RequestValidationError,
  requireEnvironmentVariable,
} from "../../utils/index.ts";

Deno.test("jsonResponse returns JSON body with status and CORS headers", async () => {
  const response = jsonResponse({ accepted: true }, 202);
  const body = await response.json();

  assertEquals(response.status, 202);
  assertEquals(body, { accepted: true });
  assertEquals(response.headers.get("Content-Type"), "application/json");
  assertEquals(
    response.headers.get("Access-Control-Allow-Origin"),
    corsHeaders["Access-Control-Allow-Origin"],
  );
  assertEquals(
    response.headers.get("Access-Control-Allow-Methods"),
    corsHeaders["Access-Control-Allow-Methods"],
  );
});

Deno.test("requireEnvironmentVariable returns set value", () => {
  const key = "TRACK_TEST_ENV_VAR";
  Deno.env.set(key, "present");

  try {
    assertEquals(requireEnvironmentVariable(key), "present");
  } finally {
    Deno.env.delete(key);
  }
});

Deno.test("requireEnvironmentVariable throws when missing", () => {
  const key = "TRACK_TEST_MISSING_ENV_VAR";
  Deno.env.delete(key);

  assertThrows(
    () => requireEnvironmentVariable(key),
    Error,
    `Missing required environment variable: ${key}`,
  );
});

Deno.test("RequestValidationError has expected name and message", () => {
  const error = new RequestValidationError("site_id is required");

  assertEquals(error.name, "RequestValidationError");
  assertEquals(error.message, "site_id is required");
  assertEquals(error instanceof Error, true);
});
