# CRUD & Flow Coverage Checklist

> A comprehensive verification gate to ensure all entity operations and state machine transitions have test coverage.

---

## 1. Per-Entity CRUD Surface Checklist

For every core business entity, verify:

### Create (POST)
- [ ] Happy path: Valid payload creates record, returns 201 with generated ID.
- [ ] Schema validation: Missing required fields returns 400 with specific field errors.
- [ ] Boundary values: Empty strings, max string lengths, zero/negative quantities handled cleanly.
- [ ] Duplicate check: Creating duplicate unique field (e.g. email, slug) returns 409 Conflict.
- [ ] Auth guard: Unauthenticated request returns 401; unauthorized role returns 403.

### Read (GET)
- [ ] List query: Returns paginated array with total counts.
- [ ] Filtering & Search: Filter by status, search by keyword returns exact matching subset.
- [ ] Single item detail: Fetch by valid ID returns complete object.
- [ ] Not found: Non-existent ID returns 404 cleanly.
- [ ] Tenant isolation: Fetching an ID belonging to another tenant returns 403 or 404 (zero data leak).

### Update (PUT / PATCH)
- [ ] Happy path: Modifying allowed field updates record and updates timestamp.
- [ ] Read-only field protection: Attempting to modify immutable fields (`id`, `created_at`, `tenant_id`, `role`) is rejected or ignored.
- [ ] Concurrency/Conflict: Concurrent updates or invalid state transitions return 409 Conflict.

### Delete / Archive (DELETE)
- [ ] Soft-delete / Archive: Sets `is_deleted` or `status: ARCHIVED`; record excluded from normal list queries.
- [ ] Integrity check: Cannot hard-delete records with active child relations / financial history.

---

## 2. State Machine Transition Verification

- [ ] Verify each valid transition (e.g., `PENDING` $\to$ `PAID`, `PAID` $\to$ `CANCELLED`).
- [ ] Verify rejection of invalid backwards or skipped transitions (e.g., `CANCELLED` $\to$ `PAID` $\to$ must return 409/422).
