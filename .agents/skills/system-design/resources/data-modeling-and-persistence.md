# Data Modeling, Entity Relationships & Storage Strategies

> Guidelines for relational and non-relational data modeling, indexing, primary key selection, and consistency boundaries.

---

## 1. Primary Key Strategies

| Key Strategy | Strengths | Trade-offs | Best Used For |
|---|---|---|---|
| **UUIDv7 (Time-Ordered)** | Globally unique, sorts chronologically, highly index-friendly in B-Trees | 36 characters string / 16 bytes binary | High-volume distributed tables, audit logs, transactions |
| **NanoID / CUID2** | Compact, URL-safe, non-guessable, collision-resistant | Random order causes B-Tree index fragmentation if used at huge scale | Public references (`orderNo`, `ticketCode`, public URLs) |
| **Auto-Increment Integer / BigInt** | Most compact (4-8 bytes), maximum B-Tree index efficiency | Predictable/enumerable (IDOR risk if exposed publicly) | Internal surrogate keys behind public UUIDs/NanoIDs |

---

## 2. Relational Modeling Disciplines

1. **Normalization vs Pragmatic Denormalization:**
   - Normalize core transactional entities (3NF) to eliminate data anomalies.
   - Denormalize only with clear justification (e.g. storing `organizer_name` on historical invoice snapshot to preserve invoice state even if organizer changes their legal name later).
2. **Explicit Foreign Keys & Cascade Policies:**
   - Always define explicit foreign keys.
   - Restrict `ON DELETE RESTRICT` for entities with financial or transaction history (Orders, Tickets, Invoices). Never `CASCADE DELETE` financial records.
3. **Compound & Partial Indexes:**
   - Create compound indexes matching frequent query predicates:
     `CREATE INDEX idx_orders_org_created ON orders (organizer_id, created_at DESC);`
   - Use partial indexes for sparse high-frequency queries:
     `CREATE INDEX idx_unsettled_orders ON orders (organizer_id) WHERE settlement_status = 'UNSETTLED';`
