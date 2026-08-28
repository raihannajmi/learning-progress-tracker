# Phased System Migration & Legacy Rewrite Strategy

> Guidelines for managing system migrations, data refactoring, and rewrites without downtime using the Strangler Fig pattern.

---

## 1. The Strangler Fig Migration Pattern

Never attempt a "Big Bang" rewrite of a live production system. Migrate incrementally:

```text
Phase 1: Shadow / Dual-Write
  → New system receives traffic and writes in parallel; output compared against legacy.
Phase 2: Read Switch
  → Switch read traffic to the new system; legacy kept as warm fallback.
Phase 3: Write Switch
  → New system becomes authoritative source of truth.
Phase 4: Cleanup & Decommission
  → Decommission legacy tables, endpoints, and adapters.
```

---

## 2. Zero-Downtime Database Schema Migrations

Follow the expand/contract model:
1. **Expand:** Add new nullable column or new table. Deploy backend code that writes to BOTH old and new.
2. **Backfill:** Run background job to populate historical data into the new structure.
3. **Contract:** Deploy backend code that reads exclusively from the new structure.
4. **Cleanup:** Drop old column/table in a subsequent migration once confirmed stable.
