export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, apikey",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Expose-Headers": "X-Ip-Hash",
};

export { getClientIp, hashIp } from "./ip.ts";

export class RequestValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RequestValidationError";
  }
}

export function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export function scriptResponse(ipHash?: string | null): Response {
  const headers: Record<string, string> = {
    "Content-Type": "application/javascript",
    ...corsHeaders,
  };

  if (ipHash) {
    headers["X-Ip-Hash"] = ipHash;
  }

  const body = ipHash ? `void("${ipHash}");` : "void 0;";

  return new Response(body, {
    status: 200,
    headers,
  });
}

export function requireEnvironmentVariable(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
