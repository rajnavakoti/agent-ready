# OrderFlow Platform — SRE Knowledge Base

## Architecture Overview
47 microservices on Kubernetes (GKE), 3 clusters (us-east1, eu-west1, ap-southeast1). Traffic routed via Cloudflare → Istio ingress → service mesh.

## Core Services
| Service | Owner | Criticality | Dependencies |
|---------|-------|-------------|--------------|
| order-gateway | Team Alpha | P0 | auth-service, inventory-api, payment-engine |
| payment-engine | Team Bravo | P0 | stripe-adapter, fraud-scorer, ledger-db |
| inventory-api | Team Charlie | P1 | warehouse-sync, catalog-db, redis-cache |
| fulfillment-orchestrator | Team Delta | P1 | shipping-adapter, warehouse-api, notification-service |
| notification-service | Team Echo | P2 | email-provider (SendGrid), sms-provider (Twilio), push-service (Firebase) |

## Known Failure Modes
- **order-gateway timeout cascade**: When payment-engine latency exceeds 5s, order-gateway retries 3x with no backoff, causing thundering herd. Circuit breaker threshold: 50% failure rate over 30s window.
- **inventory-api cache stampede**: Redis cache TTL is 5 minutes. High-traffic items expire simultaneously. Mitigation: jittered TTL (5min ± 30s) added in v2.3.1 but not applied to catalog categories.
- **fulfillment-orchestrator split-brain**: During region failover, in-flight orders can be claimed by both regions. Resolution: manual reconciliation via `kubectl exec` into ledger-db and running `scripts/reconcile_orders.sh`. Only 2 people know this procedure (Sarah M., José L.).
- **notification-service backpressure**: SendGrid rate limit is 600 emails/minute. During flash sales, queue backs up. No dead letter queue — failed notifications are silently dropped.

## Monitoring
- **Grafana dashboards**: `sre-overview` (golden signals), `payment-health`, `order-pipeline`, `regional-latency`
- **Alerting**: PagerDuty integration. P0 = page on-call immediately. P1 = page if not ack'd in 15min. P2 = Slack #alerts only.
- **SLOs**: order-gateway 99.95% availability, p99 latency < 500ms. payment-engine 99.99% success rate for transactions.
- **Logs**: Structured JSON via Fluentd → BigQuery. Retention: 90 days hot, 1 year cold (GCS).

## Runbook Index
| Runbook | Last Updated | Status |
|---------|-------------|--------|
| RB-001: Order gateway restart | 2026-01-15 | Current |
| RB-002: Payment engine failover | 2025-08-20 | ⚠️ Outdated (pre-Stripe migration) |
| RB-003: Database failover | 2025-11-03 | Current |
| RB-004: Redis cluster recovery | 2024-06-12 | ⚠️ Outdated (pre-cluster upgrade) |
| RB-005: Region failover | 2025-09-30 | Current |
| RB-006: Notification backpressure | — | ❌ Does not exist |

## Recent Incidents (Last 90 Days)
- **INC-2891** (Feb 28): payment-engine p99 spike to 12s during EU morning peak. Root cause: connection pool exhaustion on ledger-db. Fixed by increasing pool from 20 → 50.
- **INC-2847** (Feb 15): 23-minute outage in ap-southeast1. Root cause: GKE node auto-repair killed 3 nodes simultaneously during a memory pressure event.
- **INC-2803** (Jan 30): notification-service dropped 14,000 order confirmation emails during flash sale. No alert fired — failure was silent.

## Tribal Knowledge
- The `warehouse-sync` service has an undocumented 2-second sleep between batch syncs that was added as a "temporary fix" in 2023 to avoid warehouse API rate limiting. Removing it causes 429 errors.
- José L. is the only person who can manually reconcile split-brain orders. He's on vacation Aug 1-15.
- The fraud-scorer model was retrained in January but the feature store schema changed. Old features are silently coerced to 0, reducing fraud detection accuracy by ~12%. Only the ML team knows this.
