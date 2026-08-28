---
name: qa-testing
description: >
  Use this for ANY QA verification, end-to-end user flow testing, API test automation,
  adversarial edge-case discovery, test plan design, test suite authoring & code scaffolding
  (Supertest, Vitest, Jest, Playwright, Cypress, Pytest, Go test), and test suite execution —
  across ANY technology stack.
  Acts as both an adversarial quality engineer and an automated test code author:
  crawls 100% of discovered application routes and actors, maps chained stateful business flows,
  writes real executable test suites with shared state context across stages, tests negative boundaries,
  and executes test suites to deliver verified evidence.
  Trigger on "buatkan test QA/E2E/API", "tulis test script", "jalankan test end-to-end",
  "setup playwright/supertest/vitest", "test flow dari login sampai selesai", "test semua CRUD-nya",
  "qa testing", "buat test case", or /qa-testing.
---

# Quality Assurance & Test Code Automation (Project-Agnostic)

A comprehensive, evidence-driven QA skill for mapping business flows, **crawling 100% of existing application endpoints and actors**, authoring stateful chained test pipelines, scaffolding test harnesses, and executing test suites with full diagnostic verification.

```text
resources/
├── flow-mapping-test-plan.md          Mapping full-surface routes and chained multi-actor test pipelines
├── api-testing-playbook.md            Writing executable API test code (Supertest, Vitest, Jest, Pytest, Go test)
├── e2e-browser-playbook.md            Writing executable Browser E2E automation (Playwright, Cypress, POM, auth state)
├── test-data-fixtures-seeding.md      Isolated test database, deterministic fixtures, factories, and cleanup discipline
├── crud-flow-coverage-checklist.md    Full-surface coverage checklist: all routes, roles, FSM transitions, and negative guards
└── execution-and-reporting.md         Installing deps, running suites, diagnosing failures (Bug vs Flake vs Spec Gap), reporting
```

---

## 1. Purpose

To guarantee total system correctness, reliability, and state integrity across every module and user persona. This skill operates under the principle that **isolated tests alone are insufficient** — real-world software reliability requires **Chained Stateful Flow Testing (Staged E2E)** where entities produced in upstream stages (auth tokens, event IDs, category IDs, order numbers, QR codes) flow directly into downstream stages (checkout, payment, multi-tenant gate scan, financial settlement, audit logging).

---

## 2. Scope

### In Scope
- **Full Route Surface Discovery:** Discovering 100% of existing route definitions (`*.routes.ts`, controller endpoints, router manifests) across all modules.
- **Multi-Role Chained Pipelines:** Simulating realistic end-to-end journeys across all user roles (e.g. Superadmin $\to$ Organizer Owner $\to$ Staff $\to$ Customer $\to$ Guest).
- **Negative & Adversarial Boundary Guard Testing:** Testing invalid states, cross-tenant attacks (IDOR / wrong organizer scans), attendee count mismatches, and blocked deletions (e.g. deleting sold tiers).
- **Test Code Authoring & Execution:** Writing complete, runnable test files and executing them via CLI runners (`tsx`, `vitest`, `jest`, `playwright`, `pytest`).
- **360-Degree Cross-Portal Reconciliation:** Proving that mutations performed by one actor (e.g. Staff scanning a ticket) accurately reflect across all consumer views (Customer portal ticket status, Organizer metrics, Admin settlement ledgers, Audit logs).

### Out of Scope
- Production feature building or database schema refactoring $\to$ delegate to `frontend` or `backend`.
- High-level system architecture and ADR authoring $\to$ delegate to `system-design`.
- Static defensive security compliance reviews $\to$ delegate to `security`.
- Active penetration attacks and vulnerability exploit chains $\to$ delegate to `pentest`.

---

## 3. The 4 Mandatory Rules of Chained Flow Testing

1. **Rule 1: Zero Isolated Island Tests (Chained Context Mandatory):**
   - Never create throwaway mock IDs for downstream operations.
   - Stage $N+1$ MUST consume the live dynamic outputs (IDs, tokens, slugs, codes) produced by Stage $N$.
2. **Rule 2: Full Route Surface Mapping (No Forgotten Endpoints):**
   - Crawl all route files in `src/modules/` or equivalent directory.
   - Every module (Auth, Settings, Events, Tickets, Orders, Payments, Check-in, Customer, Settlement, Reports, Audit) must be visited in the test journey.
3. **Rule 3: Dual-Path Verification (Happy Path + Negative Guard at Each Stage):**
   - Test the successful transition (e.g., Unsold tier is deleted successfully).
   - Test the corresponding defensive guard (e.g., Sold tier deletion is rejected with `400 TIER_HAS_ACTIVE_ORDERS`).
4. **Rule 4: Multi-Tenant & Cross-Role Isolation Verification:**
   - Test that Actor A from Tenant 1 cannot access, scan, or modify entities belonging to Tenant 2 (e.g. Gate Staff from Organizer A scanning a ticket from Organizer B $\to$ expect `403 ORGANIZER_MISMATCH`).

---

## 4. Analysis & Execution Methodology

$$\text{Route Surface Recon} \longrightarrow \text{Actor Mapping} \longrightarrow \text{Chained Pipeline Authoring} \longrightarrow \text{Live Execution} \longrightarrow \text{Full Diagnostic Reporting}$$

### The 10 Inquiries for Every Chained Test Suite
1. **Did I inspect all route files in the codebase?** (List all route files and ensure no module was omitted).
2. **Who are all the actors involved?** (Superadmin, Tenant Owner, Staff, Customer, Guest).
3. **What is the state progression?** (Draft $\to$ Published $\to$ Checkout $\to$ Pending $\to$ Paid $\to$ Issued $\to$ Checked In $\to$ Settled).
4. **Is every ID dynamically passed from upstream?** (No hardcoded entity IDs).
5. **Are negative branches tested at high-risk transitions?** (Mismatched attendee count, duplicate check-in, cross-tenant scan).
6. **Are monetary calculations verified with exact precision?** (Platform fee, PG fee, Net settlement).
7. **Is multi-tenant domain / host header routing verified?** (Testing custom domain configs).
8. **Did the test runner actually execute against the server/DB?** (Capture live CLI output).
9. **Did any assertion fail?** (Diagnose root cause: Bug vs Outdated Test vs Transient Environment).
10. **Is the entire pipeline repeatable and idempotent?** (Using unique dynamic slugs/emails per test run).

---

## 5. Output Format: Chained Test Execution Report

```markdown
# Comprehensive Chained E2E Test Execution Report

## 1. Discovered Route & Module Surface
- Total Route Modules Discovered: [N]
- List of Modules Tested: [Auth, Events, Tickets, Orders, Payments, Check-in, Customer, Settlements, Admin Settings, Reports, Audit]

## 2. Multi-Actor Chained Journey Summary
- **Superadmin:** Global Platform Fee & Gateway Config $\to$ Settlement Processing
- **Organizer Owner:** Event Lifecycle (Draft $\to$ Tiers CRUD $\to$ Publish) $\to$ Financial Dashboard
- **Customer / Buyer:** Multi-Tenant Storefront Discovery $\to$ Registration $\to$ Checkout $\to$ Payment $\to$ Portal
- **Gate Staff:** QR Scanner $\to$ Admittance $\to$ Anti-Duplicate & Tenant Isolation Guards

## 3. Stage Execution Results Table

| Stage # | Actor & Action | Consumed Upstream State | Expected Outcome | Status |
|---|---|---|---|---|
| 1 | Superadmin Config | None (Seed Admin) | 200 OK (Fee set to 3%) | ✅ PASS |
| 2 | Organizer Create Event | Org Token | 201 Created (eventId generated) | ✅ PASS |
| 3 | Organizer Tiers CRUD | eventId | 201 Created / 200 Deleted | ✅ PASS |
| 4 | Storefront Discovery | eventSlug | 200 OK (Visible to public) | ✅ PASS |
| 5 | Buyer Checkout | eventId, ticketTypeId | 201 Created (orderNo generated) | ✅ PASS |
| 6 | Payment Confirmation | orderNo | 200 OK (Tickets ISSUED) | ✅ PASS |
| 7 | Staff Check-in Scan | ticketCode | 200 OK (CHECKED_IN) | ✅ PASS |
| 8 | Anti-Duplicate Guard | Same ticketCode | 409 Conflict | ✅ PASS |
| 9 | Cross-Tenant Scan Guard | Other Org Staff + ticketCode | 403 Forbidden | ✅ PASS |
| 10 | 360 Reconciliation | eventId, orderNo | 200 OK (Ledger matching) | ✅ PASS |

## 4. Defect Findings & Diagnostic Breakdown (if any)
```

---

## 6. Verification & Self-Review

Before concluding any QA task:
- [ ] 100% of discovered route modules are integrated into the test journey.
- [ ] No isolated mock islands: all stages pass real dynamic entity IDs down the chain.
- [ ] Negative guards (e.g. cross-tenant access, attendee count mismatch, duplicate scan, invalid delete) are explicitly tested.
- [ ] The test script was executed in the current session and passed 100%.
