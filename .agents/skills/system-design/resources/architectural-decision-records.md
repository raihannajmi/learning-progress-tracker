# Architecture Decision Records (ADRs)

> Practical framework for capturing important architectural decisions, rationale, context, and trade-offs.

---

## 1. Structure of an Architecture Decision Record

Every non-trivial architectural choice (database selection, state machine design, sync vs async communication, framework migration) should be documented with a concise ADR:

```markdown
# ADR-[NUMBER]: [Title: e.g. Adopt PostgreSQL over MongoDB for Core Ticketing Engine]

## Status
[ PROPOSED | ACCEPTED | SUPERSEDED | DEPRECATED ]

## Context & Problem Statement
What is the business and technical context? What problem are we trying to solve? What are the key constraints (data integrity, query patterns, latency, developer skill set)?

## Decision Drivers
1. Need for strict ACID guarantees across multi-item inventory reservations and payments.
2. High frequency of complex relational joins between Orders, Tickets, Attendees, and Settlements.
3. Need for row-level locking and atomic constraints (`UNIQUE`, `CHECK`, foreign keys).

## Considered Options
- Option 1: MongoDB (Document Store)
- Option 2: PostgreSQL (Relational Database)
- Option 3: DynamoDB (Managed Key-Value / Document)

## Decision Outcome
Chosen Option: **Option 2 (PostgreSQL)** because it natively provides ACID transactions, robust foreign keys, sub-millisecond relational queries with proper indexing, and full JSONB support for flexible metadata.

## Consequences & Trade-offs
### Positive Impact:
- Zero risk of orphaned records during payment transitions due to atomic `db.transaction`.
- Financial ledgers and settlements can be queried via standard SQL with aggregate safety.
### Negative / Trade-offs Accepted:
- Horizontal scaling requires connection pooling (e.g. PgBouncer) and read replicas rather than automatic sharding.
- Schema migrations must be strictly versioned and backward-compatible.
```
