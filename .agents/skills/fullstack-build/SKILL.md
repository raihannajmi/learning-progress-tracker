---
name: fullstack-build
description: >
  Use this for ANY work on a product built with Express.js, Vite+React
  (or Next.js), and PostgreSQL+Prisma (+ Redis) — new product from
  scratch, adding/extending a feature, auditing existing code, fixing
  audit findings, schema/migration work, validation, security hardening,
  design-system/typography/responsive UI, background jobs, file storage,
  or PDF generation. Covers the full lifecycle: plan → build backend →
  build frontend → validate & secure → review/audit → fix. Consult before
  writing code, creating a Prisma schema, building an endpoint or screen,
  reviewing a flow, or fixing a reported gap — even for small requests
  ("tambah field ini", "buatkan halaman X"). Trigger on "buatkan
  produk/fitur/halaman/endpoint baru", "build from scratch", "review flow
  ini", "audit backend/frontend", "fix/perbaiki temuan", "setup project
  baru", "design database schema", "audit keamanan/validasi",
  "layout/responsive/typography rusak", or /fullstack-build.
---

# Fullstack Build (Express + Vite/React + PostgreSQL)

One skill, whole lifecycle. This file is the router + the core discipline.
Detailed playbooks live in `resources/` and are loaded on demand — don't
load a reference file you don't need for the current step.

```
resources/
├── backend-build.md        Build/extend a backend feature + apply fixes
├── frontend-build.md       Plan/build/extend a frontend feature + apply fixes
├── review-audit.md         Audit-only review (backend + frontend), no code changes
├── database.md             Prisma migrations, schema integrity, unique codes
├── validation-security.md  Joi/Zod validation contracts + security hardening
├── design-system.md        Typography, icons, responsive, layout, catalog UI, forms
└── specialized.md          Background jobs/cron, file storage (S3/R2), PDF generation
```

---

## 0. Figure out the mode — always state it out loud first

Read the request and classify it, then say which mode you're in before
doing anything else:

| Mode | Trigger | Load |
|---|---|---|
| **A. Build from scratch** | new product / new project setup | §1 below, then backend-build.md + frontend-build.md + database.md as you reach each layer |
| **B. Build/extend a feature** | "tambah fitur X", "buatkan halaman Y", change to something existing | backend-build.md and/or frontend-build.md (Part 1) |
| **C. Audit / review** | "review flow ini", "audit backend/frontend", "cari yang bolong" — NO code changes | review-audit.md |
| **D. Fix a finding** | "terapkan hasil review", "fix temuan ini" — requires a prior audit report or a specific described gap | backend-build.md / frontend-build.md (Part 2) |
| **E. Specialized concern** | migration/schema, validation, security, design/typography/responsive, background jobs, storage, PDF | the matching reference file directly |

If genuinely ambiguous between audit-only and build/fix, ask ONE question
("mau saya review dulu, atau langsung dikerjakan?") — otherwise proceed
with your best interpretation and state the assumption inline.

**Never fix an Open Business Decision or an ambiguous requirement by
guessing.** Ask.

---

## 1. Mode A — Building a product from scratch

When there's no existing codebase yet (or the user says "from scratch",
"produk baru", "setup project baru"), do this before touching any of the
per-feature playbooks:

1. **Scaffold the two apps** as a monorepo (or two repos, ask if unsure):
   - `backend/`: Express.js + Prisma + PostgreSQL, `src/{routes,controllers,services,validators,middlewares}`.
   - `frontend/`: Vite + React + Tailwind + TanStack Query + axios,
     `src/{pages,components,hooks,lib}`.
   - Shared conventions: env files (`.env.example` committed, `.env` gitignored),
     ESLint/Prettier, a root README describing how to run both.
2. **Design the core data model first** (`database.md`) — even a rough
   `schema.prisma` for the main entities before writing any route. Every
   feature after this point builds ON TOP of the schema, not the other
   way around.
3. **Stand up cross-cutting scaffolding once**, so every feature after
   this reuses it instead of reinventing it per-endpoint:
   - Global error handler + consistent API error shape.
   - `validateRequest(schema)` middleware wired into the router (see
     `validation-security.md`).
   - `helmet`, CORS allow-list, rate limiter (see `validation-security.md`).
   - axios instance with a base URL + response/error interceptor on the
     frontend; a `QueryClientProvider` at the app root.
   - Design tokens in `tailwind.config.js` (colors, spacing, type scale)
     before the first component — see `design-system.md`.
4. **Then build features one at a time** using `backend-build.md` +
   `frontend-build.md` (Mode B), not all at once — ship the narrowest
   vertical slice (one entity, full CRUD + its screen) before moving to
   the next.
5. **Before calling the scaffold "done"**, run through
   `validation-security.md`'s checklist once at the project level (not
   per endpoint) to confirm the cross-cutting pieces are actually wired,
   not just planned.

---

## 2. Core discipline that applies in every build mode (A, B, D)

These rules are the distilled core of every build playbook in this skill
— read the full version in the relevant reference file, but never skip
these even in a quick response:

1. **The literal request is a symptom, not the spec.** A number or case
   in a requirement ("2 termin", "3 kategori") is almost always
   illustrative — build the general shape (a table/list driven by data),
   not the hardcoded literal, unless the user explicitly says it will
   never change.
2. **Build the full surface, not the one endpoint/screen named.** A
   feature implies a lifecycle (create/list/get/update/delete/state
   transitions) and a full UI-state surface (loading/empty/error/
   partial/permission-denied/submitting/success/stale-after-mutation) —
   not just the happy path that was described.
3. **Cross-reference before creating.** Backend: check the existing
   schema/services for what should be touched but wasn't mentioned.
   Frontend: check existing design-system tokens/components before
   creating new ones — reuse → extend → compose → new, in that order.
4. **Show your analysis before coding**, even briefly — the generalization
   table, endpoint/UI-state table, and cross-reference notes belong in
   your response, not just in your head. Only skip this for a truly
   trivial change (typo, one color tweak).
5. **Don't over-ask.** Show the analysis every time; only pause for
   explicit confirmation when the shape change is genuinely significant
   (new model/relation, new shared component/token, destructive
   migration). Small assumptions get stated inline and you keep moving.
6. **Validate at the boundary, always.** Every mutating endpoint gets a
   validator (`validation-security.md`) — never rely on frontend
   validation alone.
7. **Self-check before declaring done** — write the checklist from the
   relevant reference file's "Self-Check" section with actual answers,
   not a silent mental pass.

---

## 3. Mode C/D discipline (audit and fix)

- **Audit produces a report, never edits code.** One flow/screen per
  report, grounded in real file/line citations — see `review-audit.md`.
- **Fix requires a grounded finding** (a report or an explicitly
  described gap) — never "just fix the backend" with no target. Fix one
  finding at a time, classify its risk tier (safe / needs migration
  review / needs explicit confirmation), and report back per finding
  before moving to the next — see Part 2 of `backend-build.md` /
  `frontend-build.md`.
- **Never auto-apply a destructive migration** to a real database —
  generate it, explain the risk, let the human apply it.

---

## 4. Quick reference: when to pull which file

- Writing/editing `schema.prisma`, migrations, or a code/ID field →
  `database.md`
- Writing a Joi/Zod validator, or doing a security pass (XSS/CORS/rate
  limit/JWT/IDOR/uploads) → `validation-security.md`
- Typography, icon sizing, responsive breakpoints, sidebar/layout
  balance, catalog/filter UI, form CTA placement → `design-system.md`
- Cron jobs, BullMQ/queues, Puppeteer/PDF rendering pipeline, S3/R2
  uploads → `specialized.md`
- Planning a screen's behavior before coding it → `frontend-build.md`
  Part 0
- Auditing without changing code → `review-audit.md`

"stop fullstack-build" or "normal mode": revert to normal coding behavior.
