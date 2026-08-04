import type { TrackingPayload } from "../types/index.ts"
import { RequestValidationError } from "../utils/index.ts"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseBeaconRequest(request: Request): TrackingPayload {
  const url = new URL(request.url);
  const sid = url.searchParams.get("sid");

  if (!sid) {
    throw new RequestValidationError("sid is required");
  }

  if (!UUID_PATTERN.test(sid)) {
    throw new RequestValidationError("sid must be a valid UUID");
  }

  const referer = request.headers.get("referer");

  if (!referer) {
    throw new RequestValidationError("Referer is required");
  }

  try {
    new URL(referer);
  } catch {
    throw new RequestValidationError("Referer must be a valid URL");
  }

  return {
    site_id: sid,
    page_url: referer,
  };
}
