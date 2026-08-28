# Concurrency Control, Idempotency & Background Jobs

> Project-agnostic guidelines for race condition mitigation, row locking, idempotent mutations, webhook reliability, and background queues.

---

## 1. Concurrency Control & Race Condition Mitigation

When multiple concurrent requests attempt to mutate a shared scarce resource (e.g. inventory quota, seat selection, bank balance, promo code redemption limit), a naive "Check-Then-Act" pattern causes race conditions:

```text
Time   Thread A (User 1)                    Thread B (User 2)
 t1    Read stock: 1 remaining              -
 t2    -                                    Read stock: 1 remaining (Both see 1!)
 t3    Deduct stock: 0                      -
 t4    -                                    Deduct stock: -1 (OVERSOLD!)
```

### Solutions (Applied by Complexity)
1. **Atomic SQL Decrement with Guard (Simplest & Best):**
   ```sql
   UPDATE items
   SET remaining_quota = remaining_quota - :requestedQty
   WHERE id = :itemId AND remaining_quota >= :requestedQty;
   ```
   Check the affected row count: if `0`, the quota was exhausted. Zero application-level lock coordination needed.
2. **Pessimistic Row Locking (`SELECT ... FOR UPDATE`):**
   Lock the specific row inside a database transaction while reading and updating.
3. **Optimistic Concurrency Control (`version` column):**
   Include `WHERE version = :currentVersion` on updates; retry if conflict occurs.
4. **Distributed Locks (Redis/Redlock):**
   Use only for cross-service, non-database distributed coordination. Avoid for standard database operations.

---

## 2. Idempotency Guarantees

An idempotent operation produces the same state regardless of whether it is executed 1 time or 10 times.

### 2.1 Idempotency Keys on Mutations
- Clients sending critical mutations (checkout, payment initiation) supply an `Idempotency-Key` header (UUID).
- Server checks an idempotency store (Redis or DB table `idempotency_keys`):
  - If key exists with status `COMPLETED`, return the cached response immediately.
  - If key exists with status `PROCESSING`, return `409 Conflict` or wait.
  - If key is new, record key, execute mutation in transaction, save result, and return response.

### 2.2 Webhook Handling Idempotency
- External payment / service providers frequently retry webhooks if they do not receive a prompt `200 OK`.
- Webhook handlers MUST verify if the event has already been processed:
  1. Lookup entity status (e.g. `order.status === 'PAID'`).
  2. If already `PAID`, immediately return `200 OK` without re-executing ticket generation or sending duplicate emails.
  3. Store webhook event ID in a `processed_webhooks` table with a `UNIQUE` constraint.

---

## 3. Background Queues & Cron Reliability

1. **Job Idempotency:** Any job running in a worker queue (BullMQ, Celery, Sidekiq, Temporal, AWS SQS) must be safe to execute multiple times upon worker retry.
2. **Dead Letter Queue (DLQ):** Failed jobs must be retried with exponential backoff (e.g. 3-5 retries) before being routed to a DLQ for operational inspection.
3. **Cron Overlap Protection:** Long-running scheduled cron tasks must use mutex/distributed lock to prevent overlapping runs if a previous run takes longer than the schedule interval.
