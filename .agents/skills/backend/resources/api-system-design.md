# API Architecture, Protocol Design & Validation Contracts

> Project-agnostic guidelines for designing clean APIs, managing validation contracts, error schemas, and protocol selection across backend architectures.

---

## 1. API Architecture & Layering Principles

Organize backend code cleanly based on actual project complexity without forcing unnecessary layers:

```text
Incoming Request (HTTP / GraphQL / gRPC / Webhook)
       ↓
[ Boundary Middleware / Guards ] → Auth verification, Rate limit, Body parsing, Schema validation
       ↓
[ Route Handler / Controller ]   → Extracts input, orchestrates domain logic, formats response
       ↓
[ Domain Logic / Service ]       → Enforces business rules, state transitions, calculations
       ↓
[ Persistence / Database ]       → Atomic queries, transactions, ORM/Driver operations
       ↓
Sanitized Response JSON / Protobuf
```

### Key Principles
1. **Thin Handlers, Thick Domain Logic:** Keep protocol-specific parsing (HTTP headers, query params) in the handler layer. Domain rules (fee calculations, inventory reservation, state transitions) should be testable without mocking HTTP request/response objects.
2. **Standardized Response Envelopes:** Keep response structures consistent across the entire API:
   - Success: `{ "success": true, "data": { ... }, "meta": { "page": 1, "total": 100 } }`
   - Error: `{ "success": false, "error": { "code": "RESOURCE_NOT_FOUND", "message": "Human readable message", "details": [] } }`
3. **Correct HTTP Semantics:**
   - `200 OK` for successful queries and synchronous updates.
   - `201 Created` for successful resource creations (with `Location` header or created object).
   - `204 No Content` for successful deletes where no body is returned.
   - `400 Bad Request` for malformed input / schema validation failure.
   - `401 Unauthorized` for missing or invalid authentication credentials.
   - `403 Forbidden` for authenticated users lacking permission (RBAC/ABAC).
   - `404 Not Found` for non-existent entities.
   - `409 Conflict` for unique constraint violations or invalid state machine transitions.
   - `422 Unprocessable Entity` for semantic business rule violations.
   - `500 Internal Server Error` for unexpected runtime faults (with sanitized client message).

---

## 2. Validation Contracts at Trust Boundaries

1. **Validate at the Boundary:** Every incoming input (URL path params, query strings, headers, request bodies, webhook payloads) MUST be strictly validated before touching domain services or database queries.
2. **Schema-Driven Validation:** Use the ecosystem's idiomatic validation tool (e.g., Zod, Joi, Pydantic, Go Validator, Class-Validator, Serde).
3. **Strict Whitelisting (Anti-Mass-Assignment):** Strip or reject unexpected fields in the request body. Never pass raw unvalidated `req.body` directly into database insert/update functions.
4. **Contract Synchronization:** Ensure frontend form rules, backend validation schemas, and database column constraints align:
   - If database column `name` is `VARCHAR(100) NOT NULL`, backend validator must enforce `string().min(1).max(100)`, and frontend input must have `maxLength={100}`.

---

## 3. Error Sanitization & Confidentiality

- **Never Leak Stack Traces in Production:** Detailed error traces, SQL query dumps, and internal file paths must be logged to internal loggers, NEVER sent to the HTTP client.
- **Hide Internal Infrastructure Details:** Do not leak database table names, third-party vendor tokens, internal microservice hostnames, or encryption salt versions in API error responses.
