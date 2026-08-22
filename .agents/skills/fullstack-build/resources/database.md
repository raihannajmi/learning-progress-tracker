# Database Reference (PostgreSQL + Prisma)

> Loaded for schema design, migrations, and data-integrity work.

# Database Migration & Schema Integrity Guard (Prisma + PostgreSQL)

Specialized guide for auditing, generating, and maintaining deterministic SQL migrations, referential integrity, and schema history in PostgreSQL and Prisma ORM.

---

## 1. Core Principles

### A. Strict Migration Tracking (No Untracked `db push` in Production)
- **Problem:** Using `prisma db push` mutates the active database directly without generating numbered SQL scripts. This creates untracked drift where local databases, CI/CD, and production environments diverge silently.
- **Rule:** Every change to `schema.prisma` MUST be accompanied by a timestamped SQL migration directory in `prisma/migrations/` (e.g., `YYYYMMDDHHMMSS_migration_name/migration.sql`).
- **Resolution when interactive CLI is unavailable:**
  1. Write the precise, idempotent SQL migration in `prisma/migrations/<timestamp>_<name>/migration.sql`.
  2. Ensure table creation uses `CREATE TABLE IF NOT EXISTS`, column additions use `ADD COLUMN IF NOT EXISTS`, and foreign keys use safe `DO $$ BEGIN IF NOT EXISTS ... END $$;` blocks.
  3. Register the applied migration in the `_prisma_migrations` tracking table.
  4. Verify with `npx prisma migrate status` ensuring output is: `Database schema is up to date!`.

---

## 2. Schema Modeling & Integrity Checklist

### A. Referential Integrity & Foreign Key Constraints
- Every relation in `schema.prisma` must have an explicit matching foreign key constraint in SQL.
- **Cascade Behavior Check:**
  - Dependent sub-entities (e.g. `RentalRequestDocument`, `InvoiceItem`, `PaymentTerm`, `RentalNegotiation`) MUST have `onDelete: Cascade` when their parent entity is deleted.
  - Financial records, payments, and users must use `onDelete: Restrict` or `SetNull` to prevent accidental loss of financial audit history.

### B. Indexing Strategy
- Foreign key columns (`asset_id`, `request_id`, `invoice_id`, `user_id`, `location_id`) MUST have indexes (`@@index([column])`).
- Composite lookup columns frequently filtered together (e.g. `[status, dueDate]`, `[requestId, round]`, `[unitUsahaId, fiscalYear]`) must have composite indexes.
- Natural business keys (e.g. `code`, `request_no`, `invoice_no`, `contract_no`, `sp_no`) must have `@@unique` constraints.

### C. Decimal vs Float for Currency & Financial Amounts
- **Rule:** Financial fields (`amount`, `price`, `subtotal`, `taxAmount`, `totalAmount`, `penaltyAmount`, `contractValue`, `allocatedQuota`) MUST ALWAYS use `Decimal @db.Decimal(15, 2)`.
- **Never use `Float`** for currency to prevent IEEE 754 floating-point rounding errors.

---

## 3. Step-by-Step Audit Workflow

```
1. Scan schema.prisma for new models, altered columns, or updated relations.
2. List all folders in prisma/migrations/ and check their migration.sql files.
3. Compare the schema diff to find any missing tables, altered columns, or missing indexes.
4. If missing migrations are detected:
   a. Create the migration directory and idempotent migration.sql.
   b. Sync the database and register into _prisma_migrations.
   c. Run `npx prisma migrate status` to confirm 100% synchronization.
```

---

## Unique business codes / identifiers

# Entity Unique Code Generator

Standardizes the design and implementation of human-readable, structured
unique codes for business entities — codes that carry semantic meaning
(category, year, sequence) rather than being opaque UUIDs.

---

## 1. Code Design Principles

### A. Anatomy of a Structured Business Code

A well-designed business code has three concerns:

1. **Prefix** — semantic category identifier (e.g. `INV`, `ORD`, `USR`,
   or a category-specific abbreviation). Short, uppercase, alphabetic.
2. **Body** — temporal or sequential anchor (year, month, sequence number,
   or a combination). Makes codes sortable and auditable.
3. **Suffix** — uniqueness component (random digits, collision-breaking
   entropy). Keeps codes globally unique even if prefix+body collide.

Example patterns:

| Entity | Pattern | Example |
|---|---|---|
| Invoice | `INV-[YYYYMM]-[SEQ_4]-[RAND_3]` | `INV-202608-0042-917` |
| Order / Request | `REQ-[YYYYMMDD]-[SEQ_4]-[RAND_3]` | `REQ-20260818-0006-194` |
| Contract | `CTR-[YYYY]-[SEQ_4]-[RAND_3]` | `CTR-2026-0006-235` |
| Asset / Item | `[CAT_CODE]-[RAND_4]` | `PRD-8421`, `SRV-1004` |
| Warning Letter | `WRN-[LEVEL]-[YYYYMM]-[SEQ_4]` | `WRN-1-202608-0004` |

**Adapt these patterns to your domain** — the structure above is a template,
not a mandate. The key invariant: every code must be human-readable,
sortable, and collision-resistant.

### B. Category-Reactive Prefix

When an entity belongs to a category that has its own code prefix (e.g.
an "Asset" belonging to category "Electronics" with prefix `ELC`):

- The prefix MUST update atomically when the user changes the category
  selection in a form — `ELC-xxxx` → `HW-xxxx` — keeping the suffix intact.
- Provide a **Regenerate** action to refresh the suffix while preserving
  the active category prefix.
- Allow manual override: user can edit the code directly in an uppercase
  monospace input.
- Category code abbreviations should be short (3–4 chars), uppercase,
  alphanumeric (`AST`, `KTN`, `AUD`, `ASR`, `SPT`, `RPT`).

### C. Form Layout & Field Dependency Ordering (IA Ergonomics)

When a unique code field is dynamically reactive to another form field (e.g., category selection determines the code prefix):

- **Strict Visual Precedence**: The source field (`Kategori`) **MUST be placed BEFORE or DIRECTLY TO THE LEFT** of the dependent code input (`Kode Registrasi`).
- **Anti-Reverse Mutation**: Never place the reactive code field *above* the category selector. Placing it above forces the user to move down to pick a category, which then mutates a field *above* their cursor — breaking top-to-bottom cognitive reading flow.
- **Recommended Flow**:
  1. Row 1: `Kategori Layanan Usaha` (Pilih jenis) + `Kode Registrasi` (Prefix otomatis ter-update + tombol Acak Ulang)
  2. Row 2: `Nama Unit Aset` + `Kapasitas`
  3. Row 3: `Gedung / Lokasi Induk` + `Detail Ruang / Bilik`

### D. Collision Prevention

Never trust client-generated codes as unique without a server-side guard.
Options in order of preference:

1. **DB unique constraint** (`@@unique([code])` in Prisma, `UNIQUE` index
   in SQL) as the final guarantee — any collision attempt fails at the DB
   level with a clear error.
2. **Optimistic retry** — generate code, attempt insert, catch unique
   constraint violation, regenerate suffix, retry (max N attempts).
3. **Atomic sequence** — use `SELECT nextval('sequence_name')` or a
   Redis `INCR` counter as the sequence component, making collisions
   structurally impossible for the sequential part.

Never rely only on application-level uniqueness checks without a DB
constraint — a check-then-insert pattern has a TOCTOU race under
concurrent writes.

### D. Validation Rules

- Code should be immutable once assigned (frozen after creation). Allow
  pre-creation changes, block post-creation changes unless there's an
  explicit re-assignment flow.
- Validate format server-side with a regex before accepting user-edited
  codes (e.g. `^[A-Z]{2,4}-\d{4,}$`).
- Always store in uppercase; normalize on input.

---

## 2. Implementation Checklist

- [ ] DB-level unique constraint on the code field.
- [ ] Server-side format validation (regex or schema-level enum).
- [ ] Category prefix updates atomically in the UI when category changes.
- [ ] Regenerate button refreshes suffix without touching prefix.
- [ ] Code is read-only in edit mode (or clearly labelled as a re-key
      with confirmation, if re-keying is allowed).
- [ ] Codes are stored uppercase; normalized on insert.
- [ ] Collision retry logic or atomic sequence in the generator.

"stop entity-unique-code-generator" or "normal mode": revert to normal behavior.
