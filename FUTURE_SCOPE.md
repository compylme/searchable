# Future Scope

Items deferred from the initial MVP implemention

## High volume sites support

The MVP uses synchronous Edge Function processing and direct Postgres inserts because the expected workload is lightweight.

At higher volumes, the ingestion pipeline could be decoupled using durable queues on either side of the processing stage. An initial queue could buffer incoming tracking payloads before validation, classification, and enrichment. A second queue could buffer processed events before persistence, allowing database writes to be retried, rate-controlled, and batched. Database partitioning could also be introduced to support sustained high-volume writes and improve query performance as the event table grows.

Each processing stage could then scale independently according to workload, while the queues provide buffering, back-pressure, and resilience during traffic spikes or temporary downstream failures.

Observability would be added across the pipeline to track metrics such as event throughput, processing latency, queue depth, oldest message age, failure rate, retry count, and database write latency. These signals, alongside performance and load-testing results tracked over time, would help identify bottlenecks, detect degraded performance, establish scaling thresholds, and guide optimisation decisions.


## Performance testing

To validate the performance after high volume sites support is implemented, a performance testing framework could be added. This could involve load testing with varying payload sizes and concurrency levels, as well as monitoring and alerting for performance regressions.



## AI bots may not execute JavaScript

A future server-side tracking option could capture crawler requests within the customer’s application or hosting infrastructure before the page is returned. For example, a customer could install a small server-side integration that reads the requested URL and User-Agent and forwards that information to the tracking service.

This would detect crawlers that fetch HTML without executing JavaScript, but it is deferred to V2 because it requires more technical integration from the customer.

Other possible approaches include:

* Using a reverse proxy, such as Nginx, to inspect incoming requests before they reach the application.
* Integrating with the customer’s hosting or CDN provider to capture request metadata at the edge.
* Providing framework-specific middleware or server-side SDKs for platforms such as Next.js.

These approaches would improve coverage, but they introduce additional setup, platform-specific implementation, and operational complexity beyond the MVP scope.

Supporting server-side tracking would likely require a more involved customer onboarding process. Unlike the JavaScript tracker, which can be added with a single script tag, server-side integrations may depend on the customer’s framework, hosting provider, reverse proxy, or CDN configuration.

A V2 onboarding flow could therefore include platform-specific setup guides, generated configuration examples, integration validation, and troubleshooting support. For more complex environments, assisted onboarding may also be appropriate to help customers implement and verify the integration correctly.
