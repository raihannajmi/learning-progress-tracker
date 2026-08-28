# Scalability, Distributed Patterns & Failure Modes

> Guidelines for designing scalable systems, caching topologies, asynchronous jobs, and fault isolation.

---

## 1. The Scaling Hierarchy (Scale from Simplest to Most Complex)

```text
Level 1: Vertical Scaling & Database Optimization (Indexes, connection pool, query tuning)
   ↓ (Handles up to ~1,000 - 5,000 QPS on a single node)
Level 2: Stateless Application Servers + Read-Replicas (Load balancer distributing read traffic)
   ↓ (Handles up to ~20,000 - 50,000 QPS)
Level 3: Strategic Caching & Async Queues (Redis cache-aside for hotspots, BullMQ/Celery for heavy jobs)
   ↓ (Handles up to ~100,000+ QPS)
Level 4: Data Partitioning / Functional Sharding / Microservices (Distributed domains)
```

> **Ponytail Rule:** Stop at the lowest level that comfortably satisfies current and near-term projected traffic. Never jump directly to Level 4.

---

## 2. Failure Modes & Resilience Patterns

1. **Circuit Breaker:** Wrap calls to slow or flaky third-party APIs (payment gateways, notification services). If error rate exceeds 50%, trip circuit and return immediate fallback.
2. **Bulkhead Pattern:** Isolate critical resource pools (e.g. Dedicated database connection pool for checkout/payments separate from background reports).
3. **Dead Letter Queue (DLQ):** Failed background jobs retry with exponential backoff (e.g. 3 attempts) before moving to DLQ for manual analysis.
