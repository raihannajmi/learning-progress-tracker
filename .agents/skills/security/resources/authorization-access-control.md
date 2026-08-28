# Authorization & Access Control (Broken Access Control Defenses)

> Project-agnostic guidelines for preventing Insecure Direct Object References (IDOR/BOLA), Privilege Escalation, and Mass Assignment.

---

## 1. Broken Object-Level Authorization (IDOR / BOLA)

### The Core Vulnerability
An application receives an object identifier from the client (e.g. `/api/documents/doc-123` or `{ "orderId": "ord-456" }`) and performs an operation without verifying that the authenticated user owns or has explicit permission to access that specific object.

### The Universal Defense
Every lookup and mutation MUST include an explicit authorization predicate:
```sql
-- Safe: strictly scopes query to authenticated user or tenant
SELECT * FROM documents WHERE id = :documentId AND user_id = :authenticatedUserId;
UPDATE orders SET status = 'CANCELLED' WHERE id = :orderId AND tenant_id = :authenticatedTenantId;
```

---

## 2. Broken Function-Level Authorization (Privilege Escalation)

- **Vertical Privilege Escalation:** Standard user invoking administrative endpoints (e.g. `/api/admin/users/promote`).
  - *Defense:* Guard administrative routes with explicit role/permission middleware on the server. Never rely on hiding UI buttons on the client.
- **Horizontal Privilege Escalation:** User A accessing or modifying User B's resources at the same permission level.
  - *Defense:* Tenant and user scoping on every database query.

---

## 3. Mass Assignment Defense

When an API accepts an incoming JSON body and binds it directly to a database model:
- **Vulnerability:** Attacker includes extra fields like `{ "role": "ADMIN", "is_verified": true, "balance": 999999 }` in their profile update request.
- **Defense:** Strict request schema whitelisting. Explicitly specify allowed fields for update, rejecting or ignoring any un-whitelisted properties.
