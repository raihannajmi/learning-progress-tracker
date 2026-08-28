# Rendering Strategy, State Lifecycles & Data Flow Reference

> Project-agnostic guidelines for choosing rendering paradigms, managing local vs server state, handling forms, and maintaining UI state completeness.

---

## 1. Rendering Strategies (Contextual Selection)

Choose or audit rendering patterns based on the specific page constraints, not dogma:

| Strategy | Best Suited For | Characteristics | Key Risks to Monitor |
|---|---|---|---|
| **Client-Side Rendering (CSR / SPA)** | Highly interactive internal dashboards, authenticated portals, real-time tools | Fast transitions after load; initial bundle download delay | Initial white screen; heavy JS bundle; client-side SEO limitations |
| **Server-Side Rendering (SSR / MPA)** | Dynamic public content, e-commerce product pages, user profile shares | Fast initial content render (TTFB/FCP); excellent SEO | Higher server compute load; hydration mismatch glitches; slower navigation if un-cached |
| **Static Site Generation (SSG)** | Documentation, marketing landing pages, blogs | Instant delivery via CDN edges; zero server runtime overhead | Stale data requiring rebuild/revalidation; dynamic auth hurdles |
| **Islands / Partial Hydration** | Content-heavy sites with isolated interactive widgets | Majority of HTML is static; JS downloaded only for interactive islands | Complexity in cross-island state coordination |

---

## 2. State Lifecycles: Local, Global, and URL Query State

Organize state into the simplest appropriate tier:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 1. URL Query State (Search params, active tab, page, filters)          │
│    → Survives page refresh, shareable links, back/forward history      │
├────────────────────────────────────────────────────────────────────────┤
│ 2. Server Cache State (Data fetched from API, cached with TTL)         │
│    → TanStack Query, SWR, RTK Query, Pinia / Custom Cache              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Global App State (Authenticated user identity, global theme/locale) │
│    → Store only truly cross-cutting app-level data                     │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Local Component State (Modal open/close, form inputs, dropdown)     │
│    → Keep state as close to where it is used as possible               │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 The URL as Source of Truth for Data Views
For listings, ledgers, and filtered views:
- **Keep filters in the URL:** `?page=2&limit=20&status=active&search=query`
- **Filter Reset Rule:** Whenever a search or filter changes, **always reset `page` to `1`**.
- **Debounced Search:** Debounce user text inputs (e.g. 300ms–500ms) before updating the URL / triggering network queries.
- **Do not duplicate URL state in local state:** Read directly from URL query params to avoid sync drift.

### 2.2 Anti-Pattern: Synchronizing Derived State
- ❌ **Anti-Pattern:** Copying props or query results into a `useState` and updating it with a `useEffect` on every prop change. This causes double renders and race conditions.
- ✅ **Clean Approach:** Compute derived state inline during render:
  ```typescript
  // Derived directly during render — zero extra state, zero effect
  const filteredItems = useMemo(
    () => items.filter(item => item.category === activeCategory),
    [items, activeCategory]
  );
  ```

---

## 3. Data Fetching & Pagination Architecture

### 3.1 Bounded vs Unbounded Data
- **Unbounded Datasets (Transactions, Orders, User lists, Audit logs):** Must use **server-side pagination** (`page`, `limit`, `cursor`). Never fetch 10,000 rows into the client for in-memory slicing.
- **Bounded Datasets (Dropdown options, predefined enum values, small category trees <100 items):** Client-side filtering is completely acceptable and simpler (YAGNI). Do NOT force server pagination on fixed 10-item lists.

---

## 4. Forms & Client Validation Contracts

1. **Unidirectional Validation:**
   - Client validation provides immediate UX feedback (instant field validation).
   - Server validation provides the absolute security and integrity boundary.
   - Client validation rules must mirror server schemas (e.g. required fields, regex patterns, max length) to prevent confusing rejected submissions.
2. **Double-Submission Prevention:**
   - Always disable the submit button and show a pending/spinner indicator while a mutation request is in-flight.
3. **Form Error Recovery:**
   - Inline field errors next to the relevant input.
   - General/network errors at the top of the form with actionable retry instructions.
   - Preserve user input on validation failure — never wipe the entire form on a rejected submit.

---

## 5. The Complete 6-State UI Matrix

Every data-driven component must account for the full spectrum of UI states:

| UI State | Required Behavior & Visual Design | Anti-Pattern |
|---|---|---|
| **1. Loading** | Structural skeleton preview matching the final layout | Generic full-screen spinner or blank white screen |
| **2. Empty** | Clear explanation of *why* there is no data + actionable CTA (`"No events found. Create your first event →"`) | Plain raw text `"No data found."` with zero next action |
| **3. Error** | Human-readable explanation + Actionable retry button | Silent crash, unhandled promise rejection, or raw stack trace |
| **4. Submitting** | Button disabled, progress indicator, optimistic update where appropriate | Clickable button during submit allowing duplicate mutations |
| **5. Disabled** | Reduced visual opacity + clear tooltip explaining why the action is restricted | Button looks active but clicks do nothing silently |
| **6. Stale / Refetch** | Subtle background indicator without jumping scroll position or flashing white | Entire page layout re-mounting and flashing white on query refresh |
