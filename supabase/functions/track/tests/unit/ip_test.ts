import { assertEquals } from "@std/assert";
import { getClientIp, hashIp } from "../../utils/ip.ts";

Deno.test("hashIp returns stable lowercase hex of length 64", async () => {
  const hash = await hashIp("203.0.113.10");

  assertEquals(hash.length, 64);
  assertEquals(/^[0-9a-f]{64}$/.test(hash), true);
  assertEquals(await hashIp("203.0.113.10"), hash);
});

Deno.test("getClientIp returns null when no IP headers", () => {
  const request = new Request("http://localhost/track");

  assertEquals(getClientIp(request), null);
});
