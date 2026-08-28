---
name: backend
description: >
  Use this for ANY backend engineering, API architecture, business logic implementation,
  database interaction, transaction management, concurrency control, idempotency,
  authentication/authorization enforcement, or backend diagnostic audit — across ANY backend
  stack (Node.js/TypeScript, Python, Go, Rust, Ruby, PHP, Java, Elixir, SQL/NoSQL databases).
  Operates without framework dogma, discovers existing codebase conventions first,
  enforces evidence-driven reasoning, prevents overengineering (no premature repository/service
  layer bloat), and guarantees data integrity.
  Trigger on "buatkan backend/API/endpoint", "audit backend", "review database/query",
  "perbaiki business logic", "idempotency/transaksi database", "backend performance",
  or /backend.
---

# Backend Engineering & System Design (Project-Agnostic)

A unified, evidence-driven backend skill for designing, building, optimizing, and auditing server-side systems, API contracts, domain logic, and data persistence across any language, framework, or database.

```text
resources/
├── api-system-design.md             API architecture, routing, protocols (REST/GraphQL/gRPC), validation contracts, error schemas
├── data-integrity-transactions.md   ACID transactions, relational/document modeling, migration safety, multi-tenant isolation
└── concurrency-idempotency.md       Race conditions, row locking, idempotent mutations & webhooks, background jobs, caching
```

---

## 1. Purpose

To build and audit reliable, secure, maintainable, and high-integrity backend systems. This skill excels at both **diagnostic auditing** (identifying data corruption risks, missing transactions, race conditions, auth holes) and **active implementation** (writing clean, performant, resilient endpoints and domain logic) without prescribing rigid architectural dogma or premature abstractions.

---

## 2. Scope

### In Scope
- **API & Protocol Design:** RESTful endpoints, GraphQL schemas, gRPC services, WebSocket channels, status codes, error schemas, versioning.
- **Business Logic & Domain Integrity:** Finite state machines (FSM), mathematical and financial calculation precision, workflow invariants.
- **Data Persistence & ACID Guarantees:** Database interactions, schema migrations, atomic transactions, row-level locks, indexes, foreign key integrity.
- **Concurrency & Idempotency:** Duplicate submission prevention, webhook retry safety, race condition prevention on scarce resources (inventories, balances).
- **Authentication & Authorization Enforcement:** Identity verification, RBAC/ABAC boundaries, tenant isolation, request scoping.
- **Resilience & Integrations:** Third-party API resilience, circuit breakers, timeout handling, background worker reliability, idempotent queues.
- **Error Handling & Observability:** Structured error responses, operational audit logging, sanitization of internal exceptions.

### Out of Scope
- Client-side DOM rendering, frontend state management, CSS styling $\to$ delegate to `frontend`.
- End-to-end automated test runner pipelines $\to$ delegate to `qa-testing`.
- Deep security compliance audits and cryptosystem vulnerability reviews $\to$ delegate to `security`.
- Active penetration probing and exploit simulation against live servers $\to$ delegate to `pentest`.

---

## 3. When to Use

- Implementing new API routes, services, data models, or background workers.
- Auditing backend code for race conditions, missing transactions, broken state transitions, or unhandled errors.
- Designing schema migrations and database interaction layers.
- Hardening multi-tenant isolation and tenant-scoped database queries.
- Optimizing slow queries, resolving N+1 query bottlenecks, or implementing caching.
- Implementing webhook listeners and payment/notification provider integrations.

---

## 4. When NOT to Use

- If the task is purely about frontend UI layouts, client state, or component rendering $\to$ use `frontend`.
- If the task is creating and running a comprehensive QA automated test suite $\to$ use `qa-testing`.
- If the task is formal infrastructure security review or OWASP compliance audit $\to$ use `security`.
- If the task is launching active adversarial attacks/exploits $\to$ use `pentest`.

---

## 5. Initial Discovery (Phase 1: Zero Assumptions)

Before writing code or critiquing architecture, inspect the codebase to establish evidence:

1. **Detect Language, Framework & Runtime:**
   - Ecosystem: Node.js (Express, Fastify, Nest, Hono), Python (FastAPI, Django, Flask), Go (Gin, Echo, Chi, standard lib), Rust (Axum, Actix), Ruby (Rails), PHP (Laravel, Symfony), Java/Kotlin (Spring Boot), Elixir (Phoenix)?
2. **Detect Data Persistence & ORM/Driver:**
   - Storage Engine: PostgreSQL, MySQL, SQLite, MongoDB, Redis, DynamoDB, Cassandra?
   - Access Layer: Raw SQL queries, Query Builder (Knex, Kysely), ORM (Drizzle, Prisma, TypeORM, SQLAlchemy, GORM, ActiveRecord, Hibernate)?
   - Migration Tooling: Flyway, Liquibase, Drizzle Kit, Prisma Migrate, Alembic, Django migrations?
3. **Detect Existing Architecture & Module Structure:**
   - Is the project a modular monolith, flat route-handler pattern, clean/hexagonal architecture, or microservice?
   - How are errors propagated and formatted?
   - How is dependency management or configuration loaded?

> **Rule:** Never force a Node.js/Drizzle/Express pattern onto a Go, Python, Java, or Rails codebase. Respect the existing architectural conventions of the repository.

---

## 6. Context Understanding (Phase 2: Operational Realities)

Assess the operational characteristics of the backend:
- **Scale & Throughput:** Is this an internal management tool with 50 daily requests, or a high-concurrency ticketing/payment system handling 1,000 requests/sec?
- **Financial & Data Criticality:** Are mutations involving real money, legally audited records, or perishable inventory?
- **Deployment Topology:** Single-instance monolith, serverless functions, or distributed multi-node cluster?

---

## 7. Analysis & Execution Methodology

Follow the disciplined **Reasoning Chain**:

$$\text{Observe} \longrightarrow \text{Understand} \longrightarrow \text{Hypothesize} \longrightarrow \text{Verify} \longrightarrow \text{Assess} \longrightarrow \text{Recommend / Build}$$

### The 10 Inquiries for Every Finding or Decision
1. **What is observed?** (e.g. Updating quota and creating order in two separate un-transactioned DB queries).
2. **Where is the evidence?** (Exact file path, line numbers, and query sequence).
3. **What is the context?** (Concurrency level, financial impact).
4. **Why is this a problem?** (If the second query fails or simultaneous requests arrive, quota is oversold or records become orphaned).
5. **Is it truly a problem here?** (If single-row read-only query, transaction is unnecessary).
6. **What is the real-world impact?** (Severity: Critical/High/Medium/Low).
7. **What is the confidence level?** (`CONFIRMED`, `PROBABLE`, or `POSSIBLE`).
8. **What are the trade-offs of changing it?** (Lock contention, database latency).
9. **What is the simplest working solution?** (Wrap in standard DB transaction with shortest diff).
10. **Is the change necessary now?** (If code is atomic and safe, do NOT rewrite for style).

---

## 8. Evidence Requirements

Every finding in audit mode or architectural decision in build mode must include:
- **File and Line Reference:** `file:///path/to/file.ts#L80-L105`
- **Concrete Code Snippet:** The exact code executing the operation.
- **Failure Scenario / Sequence Trace:** Step-by-step breakdown of how data corruption, state inconsistency, or race conditions manifest under real execution.

---

## 9. Critical Reasoning Rules & False-Positive Filters

Actively filter out false positives:
- **Flat Route Handler $\neq$ Bad Architecture:** A 40-line controller that reads input, validates, runs a query, and returns JSON does NOT need to be split into Controller + Service + Repository + DTO + Interface if it is clear and maintainable.
- **Lack of Repository Pattern $\neq$ Defect:** Modern ORMs and query builders already provide an abstraction over raw data access. Forcing an extra repository layer on top of an ORM is often pure boilerplate.
- **Absence of Microservices / Event Sourcing $\neq$ Outdated:** A well-structured monolith with relational tables and ACID transactions is superior for 99% of web applications. Do NOT recommend Kafka, RabbitMQ, or microservices without evidence of distributed team or independent scaling bottlenecks.
- **Single-Row Mutation without Transaction $\neq$ Defect:** An isolated single-row `UPDATE table SET val = x WHERE id = y` is already atomic in relational databases; wrapping it in a manual multi-statement transaction is redundant.

---

## 10. Anti-Overengineering Guardrails (Ponytail Principles)

1. **YAGNI First:** Build only the endpoints, relations, and business logic needed for current requirements. Do not build speculative plugin architectures or multi-provider abstraction layers when only one provider exists.
2. **Use Database Capabilities First:** Leverage database constraints (`UNIQUE`, `CHECK`, foreign keys, `SERIALIZABLE`, `ON CONFLICT / ON DUPLICATE KEY UPDATE`) before writing hundreds of lines of complex application-level lock coordination.
3. **Boring over Clever:** Standard synchronous HTTP request/response is easier to debug and maintain than asynchronous message queues for operations that complete in <200ms.
4. **Formula for Every Proposed Change:**
   $$\text{Current Problem} \longrightarrow \text{Evidence} \longrightarrow \text{Proposed Change} \longrightarrow \text{Benefit} \longrightarrow \text{Trade-off}$$
   *If there is no clear problem: DO NOT CHANGE WORKING CODE.*

---

## 11. Finding Classification Schema

| Severity | Definition | Example |
|---|---|---|
| **CRITICAL** | Data loss, financial corruption, multi-tenant data leak, unhandled race condition leading to double-spending, or critical auth bypass | Missing DB transaction in order checkout allowing duplicate inventory consumption; Missing tenant filter on sensitive table |
| **HIGH** | Broken business workflow, unhandled external API failure causing stuck state, non-idempotent webhook retry | Webhook retry double-crediting customer account; unhandled state machine transition |
| **MEDIUM** | Performance bottleneck (N+1 query), missing input sanitization on error responses, unindexed foreign key in large table | Unindexed foreign key causing sequential table scan on high-traffic listing |
| **LOW** | Minor inconsistency in error response shape, suboptimal status code (200 instead of 201), minor logging gap | Returning 200 OK for resource creation instead of 201 Created |
| **INFORMATIONAL** | Contextual observation, intentional architectural trade-off | "Single-instance in-memory lock used here; if scaling horizontally, upgrade to Redis distributed lock" |

**Valid Output Rule:** If an audit reveals that backend business logic and database integrity are sound, output: **"Tidak ada masalah yang signifikan / No significant issues found."**

---

## 12. Output Format

### Mode A: Diagnostic Audit Report
```markdown
# Backend Audit Report: [Module / Service / Flow]

## Context & Discovered Stack
- Runtime/Language: [e.g. Go 1.22 / Node.js 20 / Python 3.12]
- Framework: [e.g. Fastify / Django / Axum]
- Database & ORM: [e.g. PostgreSQL with Drizzle / MySQL with Prisma]

## Findings Summary
- Total Issues: [Count by Severity]

## Detailed Findings

### [BE-01] [Short Finding Title]
- **Severity:** [CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL]
- **Confidence:** [CONFIRMED / PROBABLE / POSSIBLE]
- **Location:** [file_name.ts:L40-L65](file:///path/to/file.ts#L40-L65)
- **Evidence:** `[Exact code snippet]`
- **Failure Mechanism:** [Step-by-step trace of how race condition or data corruption occurs]
- **Impact:** [Business/operational consequence]
- **Recommended Action:** [Minimal atomic fix — shortest working diff]

## Positive Observations / Valid Trade-offs
- [Solid patterns and intentional simplifications that do NOT need changes]
```

### Mode B: Implementation / Build Mode
1. Clarify API contract (Method, Path, Request Schema, Response Schema, Status Codes).
2. Model data structures with explicit constraints, foreign keys, and indexes.
3. Implement business logic with atomic database transactions and state machine validation.
4. Add idempotency guards where duplicate requests can occur.
5. Provide sanitized error handling and verify with self-check assertion scripts.

---

## 13. Verification & Self-Review

Before concluding any backend task, verify:
- [ ] No assumptions made about framework or ORM not present in the workspace.
- [ ] All multi-step mutations are wrapped in database transactions (`ACID`).
- [ ] Input validation strictly enforced at the API boundary before passing to domain logic.
- [ ] Tenant ownership derived securely from authenticated session, never trusted from client payload.
- [ ] No internal secrets or stack traces leaked in error responses.
- [ ] Working code preserved; no unnecessary abstraction layers introduced.
