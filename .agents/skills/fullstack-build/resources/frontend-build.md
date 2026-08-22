# Frontend Build & Fix Reference (Vite+React / Next.js, Tailwind tokens, TanStack Query, axios)

> Loaded when you are planning, implementing, or fixing a frontend screen/feature.

---

## PART 0 — Plan the design/behavior BEFORE coding (optional, use when reasoning through a new page)

# Frontend Design Plan

## Where this skill fits

```
frontend-design-plan  →  frontend-feature-build  →  (optional) frontend-flow-review / frontend-flow-fix
   (WHY)                      (WHAT + BUILD)
```

- `frontend-design-plan`: think and DECIDE the behavior of each component
  + the reasoning behind it, before a single line of code is written.
  Output: a blueprint document.
- `frontend-feature-build`: execute that blueprint into code. Its
  design-system reuse protocol (reuse → extend → compose → new) still
  applies, but the decisions are now grounded in the blueprint rather
  than made on-the-fly while coding.

Most common trigger: the backend is done, the user has a rough UI idea in
their head ("search bar at the top, hamburger on mobile, add button top
right") and needs it sharpened into solid design decisions before building.

## NON-NEGOTIABLE GATE

The design narrative MUST be written and shown to the user for approval
before proceeding to `frontend-feature-build` or writing any code.

Skip only for trivial changes that introduce no new components or
interactions — copy text fix, one color change, one spacing adjustment.
If there's a new component, a new flow, or a new state involved, this gate
runs, even if the user says "it's simple, just do it."

Do not start writing code in the same response as the blueprint. Wait for
explicit approval ("ok", "looks good", "proceed") before handing off to
`frontend-feature-build`.

## How to think (don't just fill a blank template)

For each key component on the page, answer these 4 questions as a
narrative — in sentences, not just checkboxes:

1. **What & when** — what is its specific behavior, and what triggers it?
   ("This search bar is dynamic — it re-fetches every time the user stops
   typing for 300ms.")
2. **Why** — the technical/UX reasoning behind the decision. Why debounce?
   Why a hamburger (at which breakpoint, how many nav items)? Why 300ms
   not 500ms?
3. **Consequences elsewhere** — if this component is shared/reused, where
   does the effect spread? ("This primary button behavior is intentionally
   aligned with the submit button on the checkout page — if one changes,
   both must change. Note the blast radius.")
4. **State & backend trace** — what states are required (loading / empty /
   error / disabled / success / stale-after-mutation), and which exact
   endpoint does each action call? Verify the endpoint exists — check the
   backend code or ask; do not assume.

4 lenses to cover for every interactive component:

- **Reuse & consistency** — is there an existing component that does this?
  What would using it buy in consistency?
- **Navigation & layout pattern** — which layout pattern applies
  (sidebar, tabs, modal, page navigation)? Why this one?
- **Data behavior** — what is the TanStack Query key, invalidation
  strategy, and backend endpoint?
- **Interaction & state** — what are all the states (including edge cases)?

If a lens is "not relevant" for a specific component, say so explicitly
and explain why — silently skipping a lens is the most common form of
under-thinking.

## Work order

1. **Trace the backend first.** Before designing UI, check what endpoints
   exist (read the backend code or schema if accessible). Don't design a
   form or list without a confirmed endpoint.
2. **Inventory the page regions.** Header, search/filter area, main
   content, primary/secondary actions, navigation, footer.
3. **Check existing patterns first** before deciding on a new one. A
   decision of "use pattern X because it's already used on page Y" is
   stronger than inventing a new pattern from scratch.
4. **Write the narrative per component** following the 4 questions above.
5. **Mark decisions that need user confirmation** — when there's a
   genuine trade-off (debounce 300ms vs 500ms, hamburger vs bottom nav),
   write both options + recommendation. Don't silently pick one.
6. **Assemble into a blueprint document** named
   `design-plan-<feature-name>.md`.
7. **Show to user, ask for explicit approval.** After approval, hand off
   as input to `frontend-feature-build`.

## Example: wrong vs right narration style

**Wrong (dry checklist, no reasoning):**
> - Search bar: debounce 300ms
> - Nav: hamburger on mobile

**Right (narrative with reasoning):**
> The search bar will be dynamic — it fetches from `GET /api/products?search=`
> every time the user stops typing for 300ms. Debounce is used (not
> fetch-on-every-keystroke) because the search endpoint queries the
> database without a full-text index, so fetching on every character
> would create request pile-up and response race conditions. TanStack
> Query key: `['products', { search, filters }]` so the cache is
> automatically consistent with active filters.
>
> For navigation: because this admin panel has 7 top-level menu items
> and many users access it on tablet-sized screens, a hamburger that
> collapses at 768px is preferred over a permanent sidebar — a permanent
> sidebar would consume too much horizontal space on tablet portrait.
> This pattern is already used on the Dashboard page, so I'll reuse
> `<AppShell>` rather than create a new nav component — behavior
> consistency is intentional.

"stop frontend-design-plan" or "normal mode": revert to normal coding behavior.

---

## PART 1 — Building a new / changed frontend feature

# Frontend Feature Build

Core principle, same as the backend counterpart: **the literal request is
a symptom, not the spec.** This applies to new screens and to edits of
existing ones equally. A request like "form pembayaran 2 termin" is one
instance of a general shape — and a request like "tambahin tabel data
transaksi" implicitly needs loading/empty/error states even though nobody
asked for those in words.

If you build only the happy path and only what was named, you will
under-build. That's the failure mode this skill exists to prevent.

---

## NON-NEGOTIABLE GATE — read this before anything else

**You must not create or edit any component/page file until you have
written out, in your response, the outputs of Steps 1–4 below** — even in
short form. This applies regardless of how small the request looks.

Two separate decisions, don't conflate them:
1. **Do I show the analysis?** Always yes, no exceptions.
2. **Do I stop and wait for the user before continuing?** Only when the
   generalization or design-system question meaningfully changes scope
   (new component vs. reusing an existing one, new API contract needed).
   For small/bounded cases, state the assumption and proceed in the same
   turn.

The only exception to writing full tables: a genuinely trivial change
with no new UI state, no new component, and no new API call (e.g. fixing
a typo in a label, adjusting a margin). Anything touching a form, a list,
a data-fetching call, or a new visual element gets the full pass.

---

## 1. Generalization Pass

Same trap as backend: numbers/cases in the request are usually
illustrative, not a hard ceiling. Show this table before coding:

| Requested | Literal UI interpretation | General shape | Why |
|---|---|---|---|

Example:
| "form with 2 installments" | 2 fixed input fields | Dynamic list of installment rows with "Add Installment" | If N installments are needed later, a static 2-field form requires a component rewrite instead of just rendering a longer array |

Also check: is a value hardcoded in the UI that should come from the
backend/config instead (page size, a dropdown's option list, a max-upload
count, a currency symbol)? Flag it the same way.

---

## 2. UI-State Surface Mapping

Never build only the "happy path" state shown in the request or mockup.
For any element that fetches or submits data, walk this checklist and
include what applies:

- [ ] **Loading** — skeleton/spinner, not a blank flash
- [ ] **Empty** — genuinely no data yet (different from an error)
- [ ] **Error** — request failed; does the user see something actionable
      (retry button), or just a silent broken UI?
- [ ] **Partial / paginated** — if the list can grow, is there
      pagination/infinite scroll, or will it silently degrade at scale?
- [ ] **Validation error** (forms) — per-field, not just a toast
- [ ] **Submitting / in-flight** — is the submit button disabled while a
      mutation is pending, preventing double-submit?
- [ ] **Success feedback** — does the user get confirmation the action
      worked (toast, redirect, updated view)?
- [ ] **Permission-denied / unauthorized** — if relevant, does the UI
      handle a 403 distinctly from a generic error?
- [ ] **Stale-after-mutation** — after a create/update/delete, is the
      relevant TanStack Query cache invalidated so the UI reflects the
      new state without a manual refresh?

Present as a table:

| State | Applies? | Ada di kode? | Rencana |
|---|---|---|---|

This table must actually appear in your response, not just inform your
code silently.

---

## 3. Design System Cross-Reference (mandatory, every time)

**Before creating any new component or writing any inline style**, check
what already exists in the codebase: tokens (`tailwind.config.js` theme
extensions, CSS variables), existing components with similar shape
(buttons, inputs, table, modal, badge/status-pill, etc).

Rules, in order of preference:
1. **Reuse an existing component as-is** if one already does this job.
2. **Extend an existing component's props** if it's 90% there but needs a
   variant (e.g. an existing `<Badge>` needs a new `status` color) —
   extend the token/variant map, don't fork a new component.
3. **Compose existing primitives** into a new component if the pattern is
   genuinely new but the building blocks (spacing scale, color tokens,
   type scale) already exist — use the tokens, never hardcode a hex color
   or a raw `px` value that isn't in the scale.
4. **Only as a last resort**, introduce a wholly new token or primitive —
   and when you do, say so explicitly and explain why nothing existing
   covers it, since every new token is something the rest of the app now
   has to stay consistent with.

Show this before coding:

| Butuh UI apa | Komponen/token existing yang cocok | Perlu baru? | Kenapa |
|---|---|---|---|

Silently hardcoding a color/spacing value or duplicating a component that
already exists elsewhere in the codebase is exactly the failure mode this
step exists to catch — check first, every time.

---

## 4. Backend Contract Trace

For every UI action that talks to the backend, trace it explicitly and
verify the endpoint actually exists (grep the codebase / check with the
user / check a paired backend-flow-review report if one exists):

```
User submits payment form     → POST /payments
  ↳ exists in backend? yes / not yet — if not, this is a blocker, not an assumption
User opens transaction list   → GET /transactions?page=&status=
  ↳ query params used in UI must match what the backend accepts
```

Also verify: does the response shape the UI expects actually match what
the backend returns (field names, nesting, pagination envelope)? If you
don't have visibility into the backend code, say so explicitly and ask,
rather than assuming a shape.

**TanStack Query specifics to get right:**
- Query key includes every param the query depends on (filters, page,
  id) — a query key missing a dependency causes stale/wrong cached data.
- Mutations that should invalidate related queries do so in `onSuccess`
  (`queryClient.invalidateQueries`) — this is the #1 source of "I saved
  but the list didn't update" bugs.
- `axios` error handling is centralized (interceptor) rather than
  duplicated per call site, so error states in §2 are handled
  consistently instead of ad hoc per component.

---

## 5. Build

Implement using: the scalable shape from §1, the full UI-state surface
from §2, reusing/extending the design system per §3, wired to real
verified endpoints per §4.

---

## 6. Self-Check Before Declaring Done — also mandatory to show

Write this out with actual answers, not just check mentally:

- [ ] Did I hardcode any value in the UI that should be dynamic/config?
- [ ] Does every data-fetching/mutating element have loading, empty, and
      error states — not just the happy path?
- [ ] Did I reuse/extend an existing design-system component/token
      instead of creating a new one, or explicitly justify why not?
- [ ] Does every mutation invalidate the queries that should reflect its
      result?
- [ ] Did I verify (not assume) that every endpoint the UI calls actually
      exists with the shape I expect?
- [ ] If I made an assumption instead of asking, is it stated explicitly?

If any box is unchecked, the feature isn't actually done — go back and
address it before reporting completion.

---

## Important Rules

* **UI states are not optional extras.** Loading/empty/error are part of
  "done," not a follow-up ticket.
* **Design system first, always.** Check before you build; reuse before
  you extend; extend before you create.
* **Never assume an endpoint's existence or shape.** Verify or ask.
* **Numbers in the request are usually illustrative** — same rule as the
  backend skill.
* **Don't over-ask.** Show the analysis every time; only block for
  confirmation when the shape change is genuinely significant.

"stop frontend-feature-build" or "normal mode": revert to normal coding behavior.

---

## Scope Boundary (vs. the other two frontend skills)

* **frontend-feature-build** (this skill): a fresh implementation/change
  request — use this by default.
* **frontend-flow-review**: audit-only, no code changes — "cek UI flow
  ini", "cari state yang bolong di halaman ini."
* **frontend-flow-fix**: applies findings from an already-produced
  frontend-flow-review report, one at a time.

If ambiguous between audit-only and build/fix, ask rather than guess.

---

## PART 2 — Applying a fix from a frontend-flow-review report

# Frontend Flow Fix

## 0. Required Input

A `frontend-flow-review-*.md` report, or a specific finding described
directly. If neither exists, ask the user to run `frontend-flow-review`
first or describe the exact gap — don't guess at what's broken.

## 1. Work One Finding at a Time

Sort P0 → P1 → P2. For each: restate it, classify risk tier, implement,
report back — same discipline as `backend-flow-fix`.

## 2. Risk Tiers

### Tier A — Safe to apply directly
- Adding a missing loading/empty/error state to one component.
- Adding a missing query-key dependency.
- Adding a missing `invalidateQueries` call after a mutation.
- Fixing a raw hex/arbitrary value to use an existing token, within one
  component.
- Disabling a submit button during `isPending` to fix double-submit.

### Tier B — Apply, but flag for review
Changes that affect more than one screen because they touch a **shared**
component or a **shared** token:
- Editing a shared component in `components/ui` (e.g. extending
  `Badge`'s variant map) — every screen using `Badge` is affected, even
  if the review only found the problem in one place. Show a quick grep
  of all usages so the user can sanity-check nothing else breaks.
- Adding/changing a design token in `tailwind.config.js` — same reasoning,
  it's global by definition.
- Changing a shared axios interceptor or query-key convention.

For these: implement the change, but explicitly list every other place
in the codebase that consumes the thing you changed, so the user can
verify the ripple effect before it ships.

### Tier C — Always confirm before touching anything
- Any fix that would change the visual design (not just fix a bug) of a
  widely-used shared component.
- Any fix that touches an API contract assumption — i.e. the "real" fix
  requires a backend change too (coordinate with `backend-flow-fix`/
  `backend-feature-build` rather than papering over it on the frontend
  alone).

## 3. Re-verify Before Editing

Re-open the exact file/line cited. If the code's already changed since
the report, adjust or skip rather than blindly patching.

## 4. Making the Change

- Match existing component/prop conventions — don't introduce a new
  styling approach (e.g. CSS modules) into a codebase that's
  Tailwind-token-based.
- Follow the TanStack Query patterns already established in the codebase
  (check how other queries/mutations are structured before adding a new one).
- For design-system fixes, follow the decision order in
  `frontend-feature-build` §3: reuse → extend → compose → new token.
- Add/update a test if the repo has test coverage for this component
  (e.g. a test asserting the error state renders when the query fails).

## 5. After Each Finding

```
Finding: [P0] <short description>
Files changed: <list>
Shared/ripple impact: <"none — isolated to this component" or list of
  other usages affected, for Tier B>
Tests added/updated: <list or "none — no test setup for this area">
Still needs from you: <e.g. "confirm this Badge color change looks right
  on the other 3 screens that use it">
```

## Important Rules

* One finding at a time, same as backend-flow-fix.
* Shared component/token changes are Tier B minimum — always show the
  blast radius.
* If a "frontend fix" actually requires a backend change too, say so and
  hand off rather than working around it with a frontend-only hack.
* Add a regression test tied to the specific gap when the repo supports it.

"stop frontend-flow-fix" or "normal mode": revert to normal coding behavior.
