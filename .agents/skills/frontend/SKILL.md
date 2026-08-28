---
name: frontend
description: >
  Use this for ANY frontend engineering, UI/UX architecture, component design,
  rendering strategy, state management, accessibility, performance optimization,
  or frontend diagnostic audit — across ANY frontend stack (React, Vue, Svelte,
  Angular, Next.js, Remix, Astro, Solid, mobile Flutter/React Native, or Vanilla HTML/CSS/JS).
  Operates without framework dogma, discovers existing codebase conventions first,
  enforces evidence-driven reasoning, prevents overengineering, and delivers robust UI solutions.
  Trigger on "buatkan frontend/halaman/komponen", "audit frontend", "review UI/UX",
  "optimasi rendering/state", "perbaiki tampilan/responsiveness", "frontend data flow",
  or /frontend.
---

# Frontend Engineering & UI/UX Architecture (Project-Agnostic)

A unified, evidence-driven frontend skill for designing, building, optimizing, and auditing client-side applications across any language, framework, or rendering paradigm.

```text
resources/
├── ui-ux-architecture.md          Information architecture, "One Page = One Job", layout ergonomics, accessibility (a11y)
├── rendering-and-state.md         CSR/SSR/SSG/Islands, state lifecycles, server/URL query state, form validation contracts
└── client-performance-hygiene.md  Runtime performance, bundle hygiene, DOM XSS & client storage security, anti-overengineering
```

---

## 1. Purpose

To deliver high-quality, accessible, responsive, performant, and resilient frontend interfaces and architectures. This skill is capable of both **diagnostic auditing** (read-only evaluation) and **active implementation/refactoring** (building clean, minimal, maintainable frontend code) without assuming any specific framework, library, or styling dogma.

---

## 2. Scope

### In Scope
- **UI/UX Architecture & Layout:** Page structure, hierarchy, visual restraint, responsive behavior, layout ergonomics.
- **Rendering & Lifecycle:** Client-side rendering (CSR), Server-side rendering (SSR), Static generation (SSG), Islands, Hydration, Streaming, and Re-render economics.
- **State Management & Data Flow:** Local UI state, shared global state, server/URL query synchronization, caching, and optimistic mutations.
- **Forms & Client Contracts:** Input handling, error feedback, validation synchronization, submission lifecycle.
- **UI State Completeness:** Loading skeletons, empty states with recovery actions, human-readable error states, submitting/disabled states, stale-data indicators.
- **Accessibility & Cross-Platform:** Semantic HTML, ARIA roles, keyboard navigation, color contrast, viewport adaptability.
- **Client-Side Security:** DOM XSS mitigation, secure token/session handling on the client, safe third-party script integrations.

### Out of Scope
- Server-side database transactions, database migrations, and backend business logic $\to$ delegate to `backend`.
- Automated test runner setup and E2E regression pipelines $\to$ delegate to `qa-testing`.
- Deep infrastructure threat modeling, backend penetration, and cryptographic reviews $\to$ delegate to `security`.
- Active adversarial offensive attacks against running servers $\to$ delegate to `pentest`.

---

## 3. When to Use

- Building new frontend screens, components, widgets, or design token systems from scratch.
- Auditing existing frontend code for UX flaws, layout breakages, responsiveness issues, or performance bottlenecks.
- Refactoring state management, data-fetching flows, or form validation logic.
- Diagnosing client-side bugs, memory leaks, unnecessary re-renders, or race conditions.
- Reviewing UI state completeness (loading, empty, error, disabled states).

---

## 4. When NOT to Use

- If the task is purely about server-side business rules, API routing, ORM schemas, or database queries $\to$ use `backend`.
- If the task is writing and executing an automated test suite across the whole system $\to$ use `qa-testing`.
- If the task is conducting a formal threat-model audit of backend/infra authentication tokens $\to$ use `security`.
- If the task is active black-box/grey-box penetration probing $\to$ use `pentest`.

---

## 5. Initial Discovery (Phase 1: Zero Assumptions)

Before proposing any changes or writing a single line of code, inspect the codebase to establish evidence of the active stack and conventions:

1. **Detect Project Type & Paradigm:**
   - Framework & Runtime: React, Vue, Svelte, Angular, Next.js, Remix, Astro, Nuxt, SvelteKit, Solid, Flutter, Vanilla JS/TS?
   - Rendering Architecture: Single Page App (CSR), Multi-Page App (MPA), Server-Rendered (SSR), Static Generated (SSG), or Islands?
   - Build Tooling & Package Manager: Vite, Webpack, Turbopack, Rollup, esbuild, Cargo, Gradle, etc.?
2. **Detect Styling & Design System:**
   - CSS Solution: Tailwind, Vanilla CSS, CSS Modules, Styled Components, Sass/Less, UI Library (Radix, Shadcn, MUI, AntD, Chakra, etc.)?
   - Existing Tokens: Typography scales, color palettes, spacing variables, break-points.
3. **Detect State & Routing Conventions:**
   - Router: File-system based (Next, TanStack, Nuxt), configuration-based (React Router, Vue Router), or custom?
   - State & Server-Sync: URL query params, TanStack Query, SWR, Redux, Zustand, Pinia, signals, native context, or local state?
4. **Detect Form & Validation Libraries:**
   - Form handling: Native form actions, React Hook Form, Formik, Zod, Yup, Valibot, standard HTML5 constraints?

> **Rule:** Never force a React/Tailwind/TanStack pattern onto a Vue/Svelte/CSS-Modules or Vanilla codebase. Always align with the established patterns of the workspace.

---

## 6. Context Understanding (Phase 2: Operational Realities)

Assess the context of the user interface before judging complexity:
- **Target Audience & Density:** Is this an internal high-density data ledger (admin, finance), an operational tool (point-of-sale, scanner), or a public consumer storefront (marketing, mobile-first)?
- **Data Volume:** Is the dataset bounded (e.g. 5-10 settings items) or unbounded (e.g. 50,000 transaction records)?
- **Performance Budget:** Does this screen run on low-power mobile devices or desktop-only workstations?
- **Device & Input Constraints:** Touchscreen, mouse/keyboard, screen reader, barcode scanner?

---

## 7. Analysis & Execution Methodology

Follow the disciplined **Reasoning Chain**:

$$\text{Observe} \longrightarrow \text{Understand} \longrightarrow \text{Hypothesize} \longrightarrow \text{Verify} \longrightarrow \text{Assess} \longrightarrow \text{Recommend / Build}$$

### The 10 Inquiries for Every Finding or Decision
1. **What is observed?** (e.g. Table fetches all 10,000 records on mount).
2. **Where is the evidence?** (Exact file path, line numbers, and network/rendering trace).
3. **What is the context?** (Dataset size, device targets, frequency of access).
4. **Why is this a problem?** (e.g. Memory bloat on mobile, 4s Time-to-Interactive).
5. **Is it truly a problem in this specific context?** (If data is fixed at 5 items, client filtering is completely acceptable and YAGNI).
6. **What is the real-world impact?** (Severity: High/Medium/Low).
7. **What is the confidence level?** (`CONFIRMED`, `PROBABLE`, or `POSSIBLE`).
8. **What are the trade-offs of changing it?** (Bundle size increase, architectural complexity).
9. **What is the simplest working solution?** (Shortest diff, native platform feature first).
10. **Is the change necessary right now?** (If working reliably with no measurable defect, preserve it).

---

## 8. Evidence Requirements

Every finding in audit mode or architectural decision in build mode must include:
- **File and Line Reference:** `file:///path/to/file.tsx#L45-L60`
- **Concrete Code Snippet or Trace:** The exact problematic or target implementation.
- **Measurable Mechanism:** Explain the failure mode (e.g. "Triggering `setState` inside `useEffect` during prop change causes synchronous cascading layout re-render").

---

## 9. Critical Reasoning Rules & False-Positive Filters

Actively filter out false positives. Do **NOT** flag any of the following as defects:
- **Large Component $\neq$ Defect:** A 300-line component that is cohesive, single-purpose, and easy to read is superior to fracturing it into 8 micro-files with prop-drilling.
- **Client-Side Filtering on Bounded Data $\neq$ Defect:** If the dataset is known to be small (<100 items, e.g. status enum options or dropdowns), fetching once and filtering client-side is faster and simpler than server-side pagination round-trips.
- **Inline Styles or Vanilla CSS $\neq$ Bad Architecture:** Clean CSS or inline utility classes that work reliably without styling library overhead are perfectly valid.
- **Absence of Global State $\neq$ Missing Feature:** If local component state or URL search params handle the state lifecycle completely, do NOT recommend Redux/Zustand/Pinia.
- **Minor Code Duplication $\neq$ Abstraction Mandate:** 3-5 lines of duplicate UI markup in two separate screens is better than an over-generalized premature abstraction with 10 boolean props.

---

## 10. Anti-Overengineering Guardrails (Ponytail Principles)

1. **YAGNI First:** Do not build multi-theme engines, complex design systems, or speculative dynamic form builders unless explicitly requested.
2. **Native Platform Features First:** Use standard HTML semantic tags (`<dialog>`, `<details>`, `<form>`, `<input type="...">`), native CSS grid/flexbox, and native URLSearchParams before reaching for heavy third-party npm packages.
3. **No Unnecessary State Layers:** If a value can be computed/derived during render (`const fullName = firstName + ' ' + lastName`), never mirror it in `useState` with a `useEffect` synchronization.
4. **Formula for Every Proposed Change:**
   $$\text{Current Problem} \longrightarrow \text{Evidence} \longrightarrow \text{Proposed Change} \longrightarrow \text{Benefit} \longrightarrow \text{Trade-off}$$
   *If there is no demonstrable problem: DO NOT CHANGE WORKING CODE.*

---

## 11. Finding Classification Schema

| Severity | Definition | Example |
|---|---|---|
| **CRITICAL** | Total UI breakage, data loss during form submit, severe accessibility blocker, or client-side auth/token leak | Uncaught promise crash in checkout form causing customer credit deduction without order creation |
| **HIGH** | Broken primary user flow, severe memory leak on unbounded list, unrecoverable error state | Client fetching 50,000 rows freezing the browser tab on load |
| **MEDIUM** | Noticeable layout distortion, missing essential UI states (no retry on network fail), degraded mobile UX | Missing empty state leading to confusion; form buttons not disabled during mutation |
| **LOW** | Minor visual inconsistency, sub-optimal re-render in low-frequency view, minor spacing drift | Padding discrepancy between modal and card |
| **INFORMATIONAL** | Architectural note, deliberate trade-off observation, context note | "Client-side sorting used here because category list is bounded to 8 items" |

**Valid Output Rule:** If an audit reveals that the existing implementation is solid and fits its constraints, the report must state plainly: **"Tidak ada masalah yang signifikan / No significant issues found."** This is a first-class, successful audit outcome.

---

## 12. Output Format

### Mode A: Diagnostic Audit Report
```markdown
# Frontend Audit Report: [Target Component/Flow]

## Context & Discovered Stack
- Framework: [e.g. SvelteKit / React / Vue]
- Rendering Mode: [CSR / SSR / SSG]
- Styling: [Tailwind / CSS Modules / Vanilla]

## Findings Summary
- Total Issues: [Count by Severity]

## Detailed Findings

### [FE-01] [Short Finding Title]
- **Severity:** [CRITICAL / HIGH / MEDIUM / LOW / INFORMATIONAL]
- **Confidence:** [CONFIRMED / PROBABLE / POSSIBLE]
- **Location:** [file_name.tsx:L12-L34](file:///path/to/file.tsx#L12-L34)
- **Evidence:** `[Exact code snippet]`
- **Impact:** [Concrete UX or performance consequence]
- **Root Cause & Rationale:** [Why this occurs]
- **Recommended Action:** [Minimal, simplest fix — shortest working diff]

## Positive Observations / Valid Trade-offs
- [Noting solid patterns and intentional simplifications that do NOT need changes]
```

### Mode B: Implementation / Build Mode
1. State the objective and UI requirements clearly.
2. Outline the component tree and state ownership.
3. Write clean, accessible, responsive code conforming to the project's existing conventions.
4. Verify all 6 UI states (Loading, Empty, Error, Submitting, Disabled, Stale/Refetch).
5. Produce a concise walkthrough of verified behavior.

---

## 13. Verification & Self-Review

Before concluding any frontend task, verify:
- [ ] No assumptions made about tools or libraries not present in the workspace.
- [ ] Keyboard accessibility and basic screen-reader attributes (`aria-expanded`, `aria-label`, semantic tags) are preserved.
- [ ] Responsive layout tested against both mobile (<640px) and wide viewports (>1280px).
- [ ] All 6 interactive UI states accounted for where data or network requests occur.
- [ ] No redundant state synchronization (`useEffect` mirroring props/state) introduced.
- [ ] Shortest working diff used; working code not rewritten for subjective style preferences.
