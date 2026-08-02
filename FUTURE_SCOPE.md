# Future Scope

Items deferred from the initial testing framework. Track these as the product matures.

## Rate limiting and abuse protection

The public `track` endpoint has JWT verification disabled so beacons can call it anonymously. There is currently no rate limiting, IP throttling, or abuse detection.

Future work:

- Add per-`site_id` and/or per-IP rate limits at the edge function or API gateway layer
- Reject obviously abusive payloads (oversized bodies, high fan-out)
- Emit metrics/alerts when thresholds are exceeded

### Related tests (when implemented)

- Unit tests for rate-limit decision helpers
- Integration tests proving over-limit requests are rejected and under-limit requests still persist
- Load / stress tests that simulate burst traffic and measure rejection behavior

## Performance benchmarking

- Capture cold-start latency for the edge function in CI or a nightly job
- Track p95 / p99 response times for successful `POST /track`
- Add a lightweight soak test to catch regressions under sustained load

## Coverage reporting

- Enable Deno coverage (`deno test --coverage=coverage`) in CI
- Publish an HTML or lcov report and optionally gate merges on a minimum threshold

## Contract testing

If additional consumers of the tracking API appear (SDKs, server-side collectors, third-party integrations):

- Formalize the request/response contract (OpenAPI or similar)
- Add consumer-driven contract tests so payload shape changes fail early

## Tracker beacon tests

`public/tracker.js` is currently untested. Future options:

- Unit-test payload construction in a DOM environment (e.g. Deno + happy-dom / linkedom)
- E2E test that serves a fixture HTML page embedding the beacon and asserts a row is recorded
