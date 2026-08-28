# Data Integrity, Database Transactions & Multi-Tenant Isolation

> Project-agnostic guidelines for ACID transactions, relational data modeling, migration safety, and multi-tenant scoping.

---

## 1. Database Transactions (ACID Guarantees)

### 1.1 The Multi-Mutation Transaction Mandate
Any operation involving **two or more dependent database mutations** MUST be wrapped in a single database transaction.

**Failure Scenarios when Transactions are Missing:**
- *Scenario A (Orphaned Records):* Step 1 creates an `Order`, Step 2 updates `TicketQuota`, Step 3 fails due to a network timeout $\to$ The order exists in DB but quota was never reserved or items were never created.
- *Scenario B (Inconsistent Financial Balances):* Debit user account succeeded, but credit merchant account failed $\to$ Money disappears into the void.

**Remediation Rule:**
Wrap in the runtime's native transaction block:
```typescript
// Idiomatic pattern: execute all dependent steps inside one transactional context
await db.transaction(async (tx) => {
  await tx.updateAccountBalance(senderId, -amount);
  await tx.updateAccountBalance(recipientId, +amount);
  await tx.insertAuditLog({ senderId, recipientId, amount, type: 'TRANSFER' });
});
```

---

## 2. Multi-Tenant Data Isolation

In multi-tenant SaaS applications, tenant isolation is a non-negotiable security boundary:

```text
                             Incoming Authenticated Request
                                           ↓
                        [ Token / Session Verification ]
                                           ↓
                          req.user = { id, role, tenantId }
                                           ↓
                 ┌─────────────────────────┴─────────────────────────┐
                 ▼                                                   ▼
       [ Standard Tenant User ]                           [ Superadmin / Operator ]
     Enforce on every query:                            Can query across tenants or
     WHERE tenant_id = req.user.tenantId                filter explicitly by query param
```

### Mandatory Rules
1. **Derive Tenant ID from Session Only:** Never trust `tenant_id` or `organization_id` sent in the request body or query parameters from a non-superadmin client. Always override or enforce using the verified `req.user.tenantId`.
2. **Tenant Scoping in Mutations:** Every `UPDATE` and `DELETE` query MUST include the tenant scope:
   `WHERE id = :id AND tenant_id = :tenantId`. This prevents IDOR where User A modifies User B's record simply by guessing an ID.
3. **Database-Level Row Security (RLS):** Where supported (e.g. PostgreSQL RLS), consider database-level tenant policies as a defense-in-depth layer.

---

## 3. Financial Precision & Immutability

1. **Integer Representation for Currency:** Never store currency amounts in floating-point fields (`FLOAT`, `DOUBLE`). Use integer units (e.g. cents, satoshis, IDR) or arbitrary-precision numeric types (`NUMERIC(15, 2)` / `DECIMAL`).
2. **Immutable Audit Trails:** Financial records, invoices, paid transactions, and legal logs must be append-only. Never perform `UPDATE` on the historical amount of a completed transaction. If a refund or correction is required, insert an adjustment record with negative/positive delta and reference the parent transaction.
3. **Configurable Business Variables:** Fees, tax rates, and commission percentages should be stored in configuration tables or environment variables, never hardcoded inside application source code.
