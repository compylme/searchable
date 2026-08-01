import type { TrackingPayload } from "../types/index.ts"
import { RequestValidationError } from "../utils/index.ts"

export async function parsePayload(request: Request): Promise<TrackingPayload> {
  try {
    return await request.json();
  } catch {
    throw new RequestValidationError("Request body must be valid JSON")
  }
}

export function validatePayload(
  payload: TrackingPayload,
): asserts payload is TrackingPayload {
  if (!payload || typeof payload !== "object") {
    throw new RequestValidationError("Invalid request body")
  }

  if (!payload.site_id || typeof payload.site_id !== "string") {
    throw new RequestValidationError("site_id is required");
  }

  if (!payload.page_url || typeof payload.page_url !== "string") {
    throw new RequestValidationError("page_url is required");
  }

  try {
    new URL(payload.page_url);
  } catch {
    throw new RequestValidationError("page_url must be a valid URL")
  }
}
