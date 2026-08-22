# Flow / Business-Logic Review Reference (audit-only, no code changes)

> Loaded when the user wants an AUDIT of existing backend or frontend code — finding gaps, not fixing them yet. After the report is produced, switch to backend-build.md Part 2 or frontend-build.md Part 2 to apply fixes.

---

## PART 1 — Backend flow review

# Backend Flow Review

Review the backend as a business system, not merely as code.

The goal is to determine whether the existing backend can correctly
**represent, execute, and track** the real business process — and, at the
level of individual fields, whether the data model actually says what the
business means.

The primary question:

> Can this business flow actually happen correctly from beginning to end,
> using the current data model and backend implementation — and does every
> important field mean what it's supposed to mean?

Do not optimize for the number of tables, abstractions, or architectural
purity. Optimize for business correctness, traceability, data integrity,
and a coherent system model.

This skill produces **one detailed report per business flow**, not a
shallow sweep of the whole codebase. Depth over breadth.

---

## 0. Before Anything Else: Discovery

Never start reasoning about business logic before you've actually read the
code. Run this discovery protocol:

1. **Identify the stack** in this repo: framework (Express? Next.js API
   routes/App Router?), ORM (Prisma? Drizzle? raw SQL?), cache/queue
   (Redis? BullMQ?), file storage.
2. **Build a short entity inventory** (model name → file → key fields)
   from the schema file (`prisma/schema.prisma`, `drizzle/schema.ts`,
   or equivalent) and any migrations directory.
3. **Locate the routes/controllers/services** that implement the flow in
   question.
4. **Locate any Redis/cache usage** relevant to the flow (cache, session,
   queue/job, rate limit, pub/sub) — cache is a common silent
   source-of-truth bug (see §7).

**Checkpoint before deep review:** confirm with the user which single
business flow to review (e.g. "checkout & payment", "user onboarding",
"subscription renewal"). Reviewing "the whole backend" in one pass produces
shallow, low-value output — this skill is built for **one flow, reviewed
deeply**. If the user really wants full coverage, run this skill once per
flow.

Do not jump from a requirement straight to "create a new entity" or "add a
new field." First determine whether the existing schema/code can already
represent it.

---

## 1. Trace the Business Flow End-to-End

Do not review models in isolation. Walk the flow step by step using a
generic shape — adapt the actual step names to what the user's business
actually does:

```
Actor
  ↓
Request / Trigger
  ↓
Validation / Business Rule Check
  ↓
State Change / Side Effect
  ↓
Persistence (Postgres via Prisma)
  ↓
Cache / Queue Interaction (Redis, if any)
  ↓
Downstream Effect (notification, next state, external API)
  ↓
Terminal / Settled State
```

For each step, answer — and cite the file where you found the answer:

* Which Prisma model represents this step? (`prisma/schema.prisma:L..`)
* Which route/controller/service triggers it? (`src/...:L..`)
* What relation connects it to the previous step?
* What triggers the next step — a DB write, a queue job, a webhook?
* What status/enum represents the current state, and where is it defined?
* What data must be persisted, and is it actually persisted (not just
  held in memory / Redis with a TTL)?
* What happens if the operation fails partway through?
* Can the system trace the complete history of this record?

If a step cannot be represented by anything in the code, that's a flow
gap — categorize it (§8) instead of silently assuming a fix.

---

## 2. Do Not Assume a Missing Entity or Field

A missing business concept does not automatically mean a new table or
column is required. Before proposing one, check against the actual schema:

1. Is the concept already represented by an existing model/field?
2. Can an existing Prisma relation represent it?
3. Is the current model overloaded with unrelated responsibilities?
4. Does the concept need an independent lifecycle (its own `createdAt`,
   its own status)?
5. Does it need its own history (can't just overwrite a column)?
6. Can multiple records of it exist independently (1:N, not 1:1)?
7. Does it have its own business rules or state machine?
8. Does it need to be referenced by more than one other model?

Only recommend a new model/field when the existing schema genuinely
cannot represent the concept — and explicitly say why the existing one is
insufficient, citing the model definition.

---

## 3. Relationship Review (Prisma-specific)

Check the actual `schema.prisma` relations, not an assumed ER diagram:

* Missing `@relation` where the business implies ownership.
* Foreign keys that are nullable when the business rule says they can't
  be (e.g. `contractId String?` on `Invoice` when every invoice must
  belong to a contract).
* Wrong cardinality — a `@relation` implemented as 1:1 when the business
  needs 1:N, or vice versa.
* Missing `onDelete`/`onUpdate` behavior for cascades that matter
  (e.g. should cancelling a parent record cascade, restrict, or just
  orphan children silently?).
* Join tables (implicit or explicit many-to-many) that don't carry
  metadata the business actually needs (e.g. `role`, `assignedAt`) and
  are forced into an implicit `@relation` when an explicit join model is
  needed.
* Relations that exist in code but bypass Prisma (raw SQL, manual joins)
  — flag if this creates a path where referential integrity isn't
  enforced.

Cite the exact relation lines. Don't recommend a relationship just
because it's technically possible — it must follow an actual business
rule you traced in §1.

---

## 4. Field-Level Review (critical flow only)

**Scope this to the flow under review** — specifically the models that
sit on the critical path (the ones carrying money, state, or identity).
Don't field-review every table in the schema; that produces noise. For
each field on a critical-path model, check:

* **Type vs. meaning** — money as `Float` instead of `Decimal`/integer
  cents; dates as `String` instead of `DateTime`; a bounded set of values
  as free `String` instead of a Prisma `enum`.
* **Nullability vs. business rule** — is a field nullable in the schema
  when the business says it's always required by a certain state?
* **Silent defaults** — a `@default(...)` that quietly encodes a business
  assumption (e.g. `status String @default("active")` skipping an
  approval step the business actually requires).
* **Ambiguous near-duplicate fields** — `amount` vs `totalAmount` vs
  `finalAmount` on the same or related models: which one is the source
  of truth, and is that documented anywhere or just tribal knowledge?
* **Mutability of values that should be frozen** — a field like
  "approved price" or "signed date" that has no application-level or
  DB-level protection against being overwritten later.
* **Dead fields** — columns still in the schema/validation but no longer
  written or read anywhere in the flow (check with a repo-wide grep, not
  assumption).
* **Missing `@unique` / composite unique constraints** implied by the
  business rule (e.g. "one active subscription per user" with no unique
  partial index or app-level guard).

Every field finding must name the exact model, field, and file location.
Do not extend this section beyond the flow's critical-path models unless
the user asks for full-schema coverage.

---

## 5. State & Lifecycle Review

Reconstruct the actual lifecycle from the enum/status field and the code
paths that mutate it — not from what you'd expect it to be:

```
DRAFT → PENDING → ACTIVE → COMPLETED
DRAFT → CANCELLED
ACTIVE → SUSPENDED → ACTIVE
ACTIVE → TERMINATED
```

Check:

* States defined in the Prisma enum but never set anywhere in code (dead
  states), or set in code but not in the enum (raw string bypass).
* Transitions the code allows but the business forbids (e.g. jumping
  `DRAFT → COMPLETED` directly through an unguarded endpoint).
* A single status field secretly representing two different concerns
  (e.g. `status` mixing "payment state" and "fulfillment state").
* States that exist in the frontend (Vite/React or Next.js UI) but have
  no backend representation at all — a button showing "Refunded" doesn't
  mean the backend has a `REFUNDED` state; find out which model actually
  owns that truth.

Only flag a missing state when the business process genuinely needs a
distinct, trackable condition — not for completeness.

---

## 6. Source of Truth & History

For every important business value on the critical path, identify:

* Which field/model is authoritative.
* When it gets copied to another model (and whether that's intentional
  freezing or accidental duplication).
* Whether it can still change after the point where the business says it
  shouldn't.
* Whether historical values are preserved (append-only log, versioned
  table) or silently overwritten by `UPDATE`.

Ask, for each critical field: *if this value changes tomorrow, can the
system still tell us what it was yesterday and why?* If not, that's a
history gap — but don't recommend a generic audit table unless the
business actually needs to answer that question.

---

## 7. Redis-Specific Review

Because Redis sits outside Postgres/Prisma's guarantees, review it as its
own trust boundary:

* **Cache vs. source of truth** — is any business-critical value ever
  read from Redis without a Postgres fallback? If Redis is flushed, does
  the business break?
* **Invalidation correctness** — when the underlying Postgres row
  changes, is the corresponding Redis key actually invalidated/updated in
  the same logical operation, or can it drift?
* **TTL vs. business meaning** — does a TTL-based expiry actually match a
  business rule (e.g. session/lock expiry), or was a TTL picked
  arbitrarily and now silently defines business behavior?
* **Queue/job idempotency** (BullMQ/Bee-Queue/etc., if present) — can the
  same job run twice and corrupt state? Is there a dedupe key?
* **Race conditions** — for counters, locks, or rate limits stored in
  Redis, are operations atomic (`INCR`, Lua script, `SETNX`) or is there
  a read-then-write race?

---

## 8. Business Rules & Transaction Boundaries

Extract business rules from requirements/code comments and determine,
with citations, where each is enforced:

* Where is the rule stored (constant, config, DB constraint, enum)?
* Where is it validated (middleware, service layer, DB constraint)?
* Can the API bypass it (e.g. a PATCH endpoint that writes `status`
  directly instead of going through the rule-checking service)?
* Can the database itself become invalid despite the rule?

For any operation that touches multiple Prisma models (e.g. confirming a
payment that must update `Payment`, `Invoice`, and `Contract` together),
check:

* Is it wrapped in a `prisma.$transaction(...)`, or are these separate
  awaited calls that can partially fail?
* If step 2 of 3 fails, what state is left behind, and is that
  recoverable?
* Does the transaction also need to touch Redis (e.g. invalidate a cache
  key) — and if the Postgres transaction rolls back, does the Redis side
  correctly not apply?

---

## 9. Optional: Design Benchmark (minimize web search)

Only do this when a gap is a genuine **modeling pattern** question (source
of truth, audit history, transaction boundary, state machine) — not for
domain-specific rules (approval limits, pricing, refund policy), which are
open business decisions, not technical patterns.

Keep it light — **at most 1–2 targeted searches per report**, only when
you're not already confident in the standard pattern:

* Prefer your own knowledge of established patterns first (e.g.
  "immutable ledger for money movements," "append-only history table,"
  "explicit state-transition table") — only search when the flow has an
  unusual shape you're not sure about.
* When you do search, summarize the *principle*, never copy structure or
  text from a specific product's docs.
* Attach it to the relevant finding as one short line: `Pattern: <principle>`.
  Don't create a separate "research section" — it should read as part of
  the recommendation, not a detour.

Default patterns to reach for before searching: immutable ledger
(append-only) for financial movements, explicit state-transition table
for complex lifecycles, event sourcing for audit requirements, CQRS
separation for diverging read/write shapes.

---

## Finding Categories

* `relation` — missing or incorrect relationship.
* `entity` — missing business concept the existing models can't represent.
* `field` — field-level type/nullability/naming/constraint issue.
* `flow` — incomplete business process.
* `state` — incorrect or incomplete lifecycle.
* `source` — unclear source of truth.
* `history` — required historical information is lost.
* `rule` — business rule missing or unenforced.
* `transaction` — business operation needs atomic consistency.
* `cache` — Redis-specific correctness issue.
* `constraint` — missing DB-level integrity constraint.
* `api` — API doesn't correctly represent or protect a business action.

## Severity

* **P0 — Blocking**: the flow can produce fundamentally incorrect
  business data or bypass a mandatory rule.
* **P1 — Important**: the flow works but data can become ambiguous,
  inconsistent, or historically untraceable.
* **P2 — Improvement**: works, but structure could be clearer or more
  future-proof.

Don't label something P0 just because a new table would be cleaner.

---

## Output Format

Write the full report to a markdown file (don't just answer inline) named
`backend-flow-review-<flow-slug>-<date>.md`. Structure:

```md
# Backend Flow Review: <Flow Name>

## Flow Map
<the traced flow from §1>

## Findings

[P0] <Model>.<field?>: <tag> <problem>
File: <path:line>
Existing: <what's actually in the code, briefly>
Gap: <what's missing or wrong>
Why: <business reason this matters>
Pattern (optional): <industry principle, one line, only if researched>
Recommendation: <smallest change that fixes it>
Affected: <models / services / API routes>

... (repeat per finding, grouped by severity)

## Existing vs Recommended

| Area | Existing | Recommended | Reason |
|---|---|---|---|

## Database Impact

### Required
<changes necessary for the flow to be correct>

### Optional
<nice-to-haves — never mixed into "required">

## Open Business Decisions
- <question the code can't answer — don't guess>

## Summary
flow: <N> P0, <N> P1, <N> P2.
Required structural changes: ...
Existing structures that should be reused: ...
Business decisions required: ...
```

If nothing significant is wrong: `Flow coherent. No critical design gaps found.`

---

## Important Rules

* **Don't over-prescribe.** Change the smallest part of the schema/code
  that correctly represents the business requirement.
* **Don't invent requirements.** Unclear approval hierarchy, refund
  policy, pricing logic, ownership, notification timing → always goes to
  Open Business Decisions, never assumed.
* **Don't confuse UI state with backend state.** A frontend label doesn't
  imply a backend column exists for it.
* **Don't create a model/field for every concept.** Only when it needs
  independent identity, relationships, lifecycle, history, or rules.
* **Every finding needs a file citation.** No file/line reference = not a
  finding, it's a guess — mark it as an Open Business Decision instead or
  go verify it in the code first.
* **One flow per report, but go deep.** Field-level detail, real
  citations, and (sparingly) real design-pattern grounding — not a
  shallow pass across the whole schema.

"stop backend-flow-review" or "normal mode": revert to normal review behavior.

---

## PART 2 — Frontend flow review

# Frontend Flow Review

Review one UI flow at a time, deeply — not a shallow sweep across every
component in the app. Ground every finding in a real file/line citation.

## 0. Discovery

1. Identify the flow's entry point (page/route) and follow it down
   through the components it renders.
2. Find the design-token source (`tailwind.config.js`, CSS variables) and
   the existing component inventory — same protocol as
   `frontend-feature-build/resources/design-system-audit.md`.
3. Find every `useQuery`/`useMutation`/`axios` call involved in this flow.
4. **Checkpoint:** confirm with the user which single flow/screen to
   review before going deep — same reasoning as the backend skill,
   breadth-first review across the whole app produces shallow findings.

## 1. UI-State Completeness

For each data-fetching or mutating element in the flow, check:

- [ ] **Loading** — skeleton or spinner shown; no blank flash
- [ ] **Empty** — distinct from error; genuinely no data yet
- [ ] **Error** — user sees something actionable (retry button), not
      just a silent broken UI
- [ ] **Partial / paginated** — if the list can grow, is there
      pagination/infinite scroll, or will it silently degrade at scale?
- [ ] **Validation error** (forms) — per-field, not just a toast
- [ ] **Submitting / in-flight** — submit button disabled while a
      mutation is pending, preventing double-submit
- [ ] **Success feedback** — user gets confirmation the action worked
- [ ] **Permission-denied** — 403 handled distinctly from generic error
- [ ] **Stale-after-mutation** — after create/update/delete, relevant
      TanStack Query cache is invalidated

Cite the exact component/line where a state is missing — not just
"loading state missing" in the abstract.

## 2. Design System Consistency

- Grep for raw hex colors / arbitrary Tailwind values (`bg-[#`, `text-[`,
  `w-[`, `p-[`) within the flow's components — each hit is a candidate
  finding unless it's a genuinely one-off case with no token that fits.
- Check for components that duplicate an existing one in
  `components/ui` or similar — near-identical markup that should have
  reused/extended an existing component instead.
- Check spacing/type consistency against the rest of the app (does this
  flow's form use the same input height/label style as forms elsewhere?).

## 3. Data-Fetching Correctness

- Query keys missing a dependency (filter/param used in `queryFn` but
  absent from `queryKey`) — this causes stale/wrong cached results.
- Mutations with no `onSuccess` invalidation, or invalidation that only
  covers one of several screens/queries that should reflect the change
  (e.g. a payment mutation invalidates the list but not the parent detail
  view's derived total).
- Duplicated error-handling/parsing logic per call site instead of a
  shared axios interceptor — flag if it's produced inconsistent error UX
  across the flow.
- Race conditions: a mutation firing before its dependent query has
  settled, or a component reading stale closure state instead of the
  live query result.

## 4. API Contract Verification

For each backend call in the flow: does the endpoint exist (check the
backend code if accessible, or a paired `backend-flow-review` report)?
Does the response shape match what the component destructures? Flag any
call where the frontend assumes a field/shape that isn't confirmed to
exist on the backend.

## 5. Accessibility (lightweight pass)

Not a full a11y audit, but flag obvious gaps within the flow: interactive
elements that aren't real buttons/links (`<div onClick>`), missing form
labels, missing focus states, color-only status indication with no text/
icon fallback.

## 6. Interaction Cost (navigation depth, popup chaining, visual clutter)

- **Navigation depth**: trace the click path from the flow's entry point
  to its goal. Count pages/steps. Flag any intermediate page that exists
  only to transit (no real decision or data entry happens there) —
  that's a candidate to collapse into the step before or after it.
- **Popup/modal chaining**: flag a popup that, on confirm, opens another
  popup, which opens another. If the combined fields across the chain
  would comfortably fit one screen/modal, that's a finding.
- **Visual clutter**: flag icons that don't communicate more than the
  adjacent label already does, decorative borders/shadows/dividers that
  carry no information, and badges/tags/counters repeated in places where
  they don't change user behavior. Don't flag icons that ARE the primary
  affordance (icon-only buttons, status icons that convey state).

Every finding here needs a concrete "why this adds cost" and a concrete
recommendation — not a vague "simplify this".

---

## Finding Categories

`state` — missing/incorrect UI state. `design-system` — token/consistency
violation. `query` — TanStack Query key/invalidation issue. `contract` —
API shape/existence mismatch. `a11y` — accessibility gap. `dup` —
duplicated component/logic that should reuse something existing.
`nav-depth` — excessive navigation steps/pages to reach a goal.
`popup-chain` — sequential modals/popups that should collapse.
`clutter` — redundant icon/decorator/visual noise with no informational
value.

## Severity

* **P0** — user-facing breakage (silent failure, stuck loading forever,
  double-submit causing duplicate mutation, data shown wrong/stale after
  an action).
* **P1** — inconsistent/confusing UX or design-system drift that will
  compound as more screens copy the pattern; also navigation-depth or
  popup-chaining findings where the extra steps meaningfully slow down a
  frequent task.
* **P2** — polish/cleanup; also visual-clutter findings and
  navigation/popup findings for infrequent or low-stakes flows.

## Output Format

Write the report to `frontend-flow-review-<flow-slug>-<date>.md`:

```md
# Frontend Flow Review: <Flow Name>

## Findings
[P0] <Component>: <tag> <problem>
File: <path:line>
Existing: <what's actually in the code>
Gap: <what's missing/wrong>
Why: <UX/correctness reason this matters>
Recommendation: <smallest fix>
Affected: <components/queries/endpoints>

## Design System Violations
| File | Issue | Existing token/component that should've been used |

## Summary
flow: <N> P0, <N> P1, <N> P2.
```

If nothing significant is wrong: `Flow coherent. No critical gaps found.`

## Important Rules

* Don't implement fixes here — that's `frontend-flow-fix`.
* Every finding needs a file citation.
* One flow per report, reviewed deeply.
* Don't invent design intent — if a pattern's "correctness" is genuinely
  a judgment call (not an established convention elsewhere in the repo),
  note it as an open question instead of asserting it's wrong.

"stop frontend-flow-review" or "normal mode": revert to normal review behavior.
