# Backend Build & Fix Reference (Express.js, PostgreSQL+Prisma, Redis)

> Loaded when you are implementing a NEW backend feature/endpoint, extending an existing one, or applying a fix from an audit report.

---

## PART 1 — Building a new / changed backend feature

# Backend Feature Build

Core principle: **the literal request is a symptom, not the spec.** This
applies just as much to "add field X to an existing feature" as it does
to a brand new feature — a request is a request, whether the target
code already exists or not. A user asking for "2 installments" is
describing one instance of a business need — your job before writing any
code is to find the general shape behind the specific number, and to build
the complete surface around it, not just the one endpoint that was named.

If you skip straight to implementing exactly what was asked, you will
under-build. That's the failure mode this skill exists to prevent —
regardless of whether you're creating something new or touching existing
code.

---

## NON-NEGOTIABLE GATE — read this before anything else

**You must not create or edit any code file until you have written out,
in your response to the user, the outputs of Steps 1–4 below** (even in
short form). This applies no matter how small or "obvious" the request
looks — a "small" request is exactly the kind of request that gets
under-thought.

This is different from asking for permission. You do NOT need to wait for
the user to reply before proceeding in most cases — you need to **show
your thinking out loud, every time**, then proceed unless the shape
change is big enough to warrant pausing (see §1's confirm-vs-proceed
rule). A silent mental pass doesn't count — if the generalization table,
endpoint table, and cross-reference notes never appeared in your actual
response, you skipped this gate.

If you catch yourself about to call a file-edit tool without having
written those sections first in the same turn: stop, go back, write them,
then continue.

The only case where you're allowed to compress this to one line instead
of full tables: a genuinely trivial change with no schema/endpoint
surface at all (e.g. fixing a typo in an error message, renaming a local
variable). If it touches a model, a route, or business logic, do the full
pass.

---

## 0. Anti-Pattern to Actively Avoid

> User: "support 2 payment installments"
> Wrong: add `installmentOneAmount`, `installmentTwoAmount` columns, or
> two hardcoded endpoints `pay-installment-1` / `pay-installment-2`.

This technically satisfies the sentence but is not what a competent
engineer would ship — the moment the business wants 3 installments, this
requires a schema migration and a rewrite instead of a data change.

Rule of thumb: **any specific number or specific case in a requirement
is almost always illustrative, not a hard ceiling** — unless the user
explicitly says "always exactly N, never more, this will never change."
Default to treating it as an instance of a general N.

---

## 1. Generalization Pass (before writing any code)

Produce this table and show it to the user before implementing:

| Requested | Literal interpretation | Likely general shape | Why |
|---|---|---|---|

Example:
| "2 payment installments" | 2 fixed columns/endpoints | `PaymentTerm` as its own model, `Order 1:N PaymentTerm`, count driven by data not schema | Business will almost certainly want 3/4/N terms later; hardcoding "2" means every count change = migration + code rewrite instead of just inserting new rows |

**Two separate decisions — don't conflate them:**

1. **Do I show the table?** Always yes. Even a small feature gets a
   one-row table. This is not optional and does not depend on size.
2. **Do I stop and wait for the user's answer before continuing?** Only
   when the general shape requires meaningfully more structure than the
   literal request implied (new model, new relation, new state machine).
   For genuinely bounded/small cases, state the assumption in the table's
   "Why" column and proceed in the same turn — don't block on
   confirmation for things that don't need it.

Never let "this seems small" cause you to skip the table entirely — that
silent skip is the exact behavior that produces under-built features.

---

## 2. Endpoint Surface Mapping

Never build only the endpoint that was explicitly requested. For the
entity/feature involved, walk this checklist and include everything that
applies — skip what genuinely doesn't apply, but check all of them:

- [ ] Create
- [ ] List / filter (with pagination if the list can grow unbounded)
- [ ] Get one (detail) — and does the detail response actually include
      the new relation/field the feature just added?
- [ ] Update — full replace or partial (`PATCH`)? Which fields are
      actually editable vs. frozen once set?
- [ ] Delete / soft-delete / cancel
- [ ] State-transition actions — one endpoint per meaningful business
      transition (`approve`, `reject`, `markPaid`, `verify`), not a
      generic `PATCH status` that lets the client set any value
- [ ] Derived/calculated views the frontend will need — is there an
      endpoint for it, or will the frontend end up computing it
      incorrectly client-side?
- [ ] Webhook/notification triggers tied to a state change

Present as a table before coding — **this table must actually appear in
your response, not just inform your code silently**:

| Endpoint | Method | Purpose | Already exists? | Needed for this feature? |
|---|---|---|---|---|

---

## 3. Frontend Interaction Trace

Sketch what a user actually does in the UI and what that hits on the
backend — this is where "missing endpoint" bugs get caught before they
ship:

```
User opens order detail          → GET /orders/:id
  (must now include paymentTerms[] — check if response shape changes)
User clicks "Pay Installment 2"  → PATCH /payment-terms/:id/pay
User clicks "View payment history"→ GET /orders/:id/payments  (exists?)
```

If a UI action you can reasonably infer from the feature has no matching
endpoint in your plan, that's a gap — add it, don't wait to be told.

---

## 4. Cross-Reference the Existing Schema

Use the same discovery approach as `backend-flow-review`
(`schema.prisma`, existing services/routes) to find what the feature
should touch that the user didn't mention.

**If this is a change to an existing feature**, this step also means:
actually open and read the current implementation (route, service,
schema fields) before touching it — don't assume its current shape from
the request alone. A request like "add a status filter to the list
endpoint" might reveal, once you actually look, that the list endpoint
has no pagination either — that's exactly the kind of thing to flag per
the rule below, not silently ignore because it wasn't asked for.

Questions to ask either way:

- Does this feature change the meaning of a status/enum on a *related*
  model (e.g. adding installments means `Order.status` now needs a
  `PARTIALLY_PAID` state that didn't exist before)?
- Does it need a relation to a model that already exists (`Notification`,
  `AuditLog`, `Invoice`) that wasn't named?
- Does an existing endpoint's response need to change shape to expose
  the new data (see §3)?

**Say this out loud even when not asked.** Example of the right tone:

> "This will also affect `Order.status` — currently only `PAID`/`UNPAID`,
> but once installments exist, an order can be `PARTIALLY_PAID`.
> I'm adding that state too, unless you want it computed from
> PaymentTerm directly without a separate field on Order — which do
> you prefer?"

---

## 5. Build

Implement using: the scalable shape from §1, the full endpoint surface
from §2, wired per §3, touching everything found in §4. Apply the same
Tier A/B/C schema-change caution as `backend-flow-fix` (safe to apply
directly vs. flag migration for review vs. confirm before touching).

---

## 6. Self-Check Before Declaring Done — also mandatory to show

Before saying the feature is done, write out this checklist **in your
response** with actual answers, not just check it mentally:

- [ ] Did I hardcode any business number that should be config/data-driven?
- [ ] Does every UI action I can infer have a matching endpoint?
- [ ] Does every new/changed model correctly show up in the endpoints
      that return its parent record?
- [ ] Did I flag any table/relation that should be touched but wasn't
      part of the original ask?
- [ ] Did I leave a note for the user on "what happens if this becomes N
      instead of the number given," where relevant?
- [ ] If I made an assumption instead of asking, is it stated explicitly
      in my response (not silently baked in)?

If any box is unchecked, the feature isn't actually done yet — go back
and address it before reporting completion.

---

## Important Rules

* **Numbers in requirements are usually illustrative.** Default to
  building the general case unless told otherwise.
* **Build the full surface, not the one endpoint named.** A feature
  request implies a lifecycle, not a single action.
* **Proactively flag cross-cutting impact.** If another table/endpoint
  needs to change because of this feature, say so even if unprompted —
  don't wait to be asked.
* **Don't over-ask.** Only pause for confirmation when the generalization
  changes the shape of the schema/API meaningfully; note small
  assumptions inline and keep moving.

"stop backend-feature-build" or "normal mode": revert to normal coding behavior.

---

## Scope Boundary (vs. the other two skills)

All three skills can touch the same codebase — the difference is what
kicks off the work:

* **backend-feature-build** (this skill): the user is asking you to
  *implement or change something*, right now, based on a fresh
  request — new feature or edit to an existing one. Use this by default
  for any implementation ask.
* **backend-flow-review**: the user wants an *audit*, no code changes —
  "review this flow", "find what's missing". Produces a report, doesn't
  write code.
* **backend-flow-fix**: the user wants you to *apply findings from an
  already-produced backend-flow-review report* — fixing specific,
  already-identified gaps one at a time, not building something new.

If a request is ambiguous between "audit only" and "build/fix it," ask
which the user wants rather than guessing — reviewing and implementing
have very different risk profiles (see backend-flow-fix's Tier A/B/C
rules for why unconfirmed schema changes are dangerous).

---

## PART 2 — Applying a fix from a backend-flow-review report

# Backend Flow Fix

Turn a `backend-flow-review` finding into an actual, correct code change
— not a rewrite of everything the report mentioned at once.

## 0. Required Input

You need one of:
1. A `backend-flow-review-*.md` report (preferred — has file citations
   already), or
2. A single finding described directly by the user.

If neither exists and the user just says "fix the backend," **stop and
ask them to run `backend-flow-review` first, or point you at the specific
finding**. Fixing without a grounded finding means guessing at the
problem, which defeats the entire point of the two-skill split.

If the report has **Open Business Decisions** relevant to the finding
you're about to fix, do not guess the answer. Ask the user first — these
are explicitly things the code can't tell you (refund policy, approval
hierarchy, pricing rules, etc).

---

## 1. Work One Finding at a Time

Sort findings P0 → P1 → P2. For each one:

1. Restate the finding (file, gap, recommendation) in one or two lines
   so the user can confirm this is still what they want fixed.
2. Classify the change by risk tier (§2).
3. Implement per the risk tier's rules.
4. Show a summary of what changed (files touched, migration generated if
   any) before moving to the next finding.

Do not silently roll multiple findings into one combined patch unless the
user explicitly asks for a batch. Small, reviewable, one-finding-at-a-time
changes are the point — this mirrors how a careful engineer would ship
fixes as separate, revertable commits.

---

## 2. Risk Tiers

### Tier A — Safe to apply directly
No confirmation needed beyond showing the diff:
- Adding a new optional field/model that doesn't touch existing data.
- Adding a missing `@relation`/`@@index`/`@@unique` that doesn't conflict
  with existing rows (verify — see §3).
- Wrapping existing multi-step writes in `prisma.$transaction(...)`.
- Adding application-level validation (Zod/Joi) that mirrors an existing
  DB constraint.
- Moving a Redis cache invalidation to after a transaction commits.
- Adding an idempotency/dedupe check to a queue job handler.

### Tier B — Apply the code change, but flag the migration for review
Anything that changes schema in a way that could affect existing data:
- Making a nullable field required (`String?` → `String`).
- Changing a field's type (`Float` → `Decimal`, `String` → `Enum`).
- Adding a `@@unique` constraint on a field that might already have
  duplicates in production data.
- Renaming a field or model.
- Adding `onDelete: Cascade`/`Restrict` where none existed.

For these: implement the code + generate the Prisma migration file, but
**do not run it against a real database**, and explicitly tell the user:
"this migration needs a data audit/backfill before it's safe to apply in
an environment with existing rows — here's why: <reason>." Show the
migration SQL so they can review it.

### Tier C — Always confirm before touching anything
- Dropping a column or model.
- Any change to a field that historical financial/legal records depend
  on (amounts, signed dates, approval records).
- Anything the report marked as touching an Open Business Decision.

For these: describe the exact change you intend to make and wait for
explicit "yes, do it" before writing any file.

---

## 3. Before Editing: Re-verify Against Current Code

The review report might be stale (code may have changed since). Before
applying a fix:

1. Re-open the exact file/line cited in the finding.
2. Confirm the gap still exists as described — if the code has already
   changed, say so and skip/adjust the finding instead of blindly patching.
3. For schema changes, check for existing data implications:
   ```bash
   # e.g. before adding @@unique, check for existing duplicates
   ```
   If you can run a query against a dev DB, do so. If you can't, say so
   explicitly rather than assuming the constraint is safe to add.

---

## 4. Making the Actual Change

Follow the existing codebase's conventions — don't introduce a new
pattern (e.g. a different validation library, a different service-layer
structure) unless the finding specifically calls for it.

**Schema changes (Prisma):**
- Edit `schema.prisma` directly.
- Generate the migration: `npx prisma migrate dev --name <descriptive_name> --create-only`
  for Tier B/C (create-only so it's not auto-applied), or a normal
  `migrate dev` for Tier A once confirmed safe.
- Run `npx prisma generate` after schema edits so the client types match.

**Service/controller changes:**
- Match the existing error-handling and response shape used elsewhere in
  the file — don't invent a new convention.
- If wrapping writes in a transaction, make sure every read the
  transaction depends on is also inside it (no read-outside-write-inside
  race).

**Redis changes:**
- Cache invalidation goes after the Postgres write commits, never before
  or inside the same non-atomic block as a write that could still fail.
- If adding a dedupe/idempotency key, document its TTL and why that TTL
  was chosen (tie it to the business meaning, not an arbitrary number).

**Tests:**
- If the repo has tests for the touched service/route, add or update a
  test that actually exercises the fixed gap (e.g. a test that submits
  the same webhook twice and asserts no double-write) — a fix without a
  regression test for the specific gap doesn't prove the gap is closed.

---

## 5. After Each Finding

Report back with:
```
Finding: [P0] <short description>
Files changed: <list>
Migration generated: <yes/no — path if yes, and whether create-only>
Tests added/updated: <list or "none — repo has no test setup for this area">
Still needs from you: <e.g. "run the migration in staging with a
  backfill script before deploying" or "confirm this is the pricing rule
  you meant">
```

Then move to the next finding, or stop if the user only wanted this one.

---

## Important Rules

* **Never fix an Open Business Decision by guessing** — ask.
* **Never batch every finding into one big diff** unless explicitly asked.
* **Never auto-apply a Tier B/C migration** to a real database — generate
  it, explain the risk, let the human apply it.
* **Re-verify the finding against current code** before patching — reports
  go stale.
* **Match existing code conventions** — don't refactor unrelated things
  while fixing one gap.
* **Add a regression test tied to the specific gap**, when the repo has a
  test setup for that area.

"stop backend-flow-fix" or "normal mode": revert to normal coding behavior.
