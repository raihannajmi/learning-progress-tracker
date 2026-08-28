# API-Level Testing & Contract Assertions

> Project-agnostic guidelines for writing fast, reliable, boundary-focused API integration tests.

---

## 1. Core Disciplines of API Testing

1. **Assert State, Not Just HTTP Status:**
   - A `200 OK` or `201 Created` is meaningless if the returned payload has corrupt data or if the database was not updated.
   - Assert: (1) HTTP status code, (2) Response envelope/schema, (3) Exact field values, (4) Persistence side-effects (query DB or fetch via `GET /items/:id`).
2. **Deterministic Sequence Execution:**
   - Tests within a flow must run in sequence (Step 1 $\to$ Step 2 $\to$ Step 3) sharing entity IDs created in earlier steps.
3. **Boundary & Malformed Inputs:**
   - Test empty strings `""`, whitespace only `"   "`, `null`, `undefined`, negative numbers `-1`, floating points where integers expected, extremely long strings (e.g. 5,000 chars), and special characters (`<script>`, SQL quotes, emoji).

---

## 2. Universal API Test Pattern

Regardless of language/framework (Node, Python, Go, Rust, Java), structure API tests around:

```text
[Setup & Fixture]
       ↓
[Authenticated Client Dispatch] (Send HTTP request with token/cookies)
       ↓
[Assert Response Code & Headers]
       ↓
[Assert Response JSON Schema & Values]
       ↓
[Assert Persistence State] (Verify database record matches expected mutation)
```

### Key Checks per Endpoint:
- **`GET /resource`**: Paginated response, sorting order, search filter accuracy, tenant scoping.
- **`GET /resource/:id`**: Returns complete detail object, returns 404 for nonexistent ID, returns 403/404 for cross-tenant ID.
- **`POST /resource`**: Valid payload creates entity; missing required field returns 400 with field-specific error.
- **`PUT / PATCH /resource/:id`**: Updates allowed fields; ignores or rejects forbidden fields (e.g. attempting to change `role` or `id`); returns 404/403 on invalid target.
- **`DELETE /resource/:id`**: Soft-deletes or archives entity; subsequent GET returns 404 or `is_archived: true`; rejects deletion if dependent records exist.
