# UI/UX Architecture & Layout Ergonomics Reference

> Project-agnostic guidelines for information architecture, visual hierarchy, layout breathing room, and accessibility across web and mobile platforms.

---

## 1. Information Architecture: "One Page = One Primary Purpose"

Every screen must answer **ONE primary question** for the user and provide **ONE clear primary next action**.

| Page / Screen Type | Primary User Question | Primary Content / Action | Anti-Pattern to Avoid |
|---|---|---|---|
| **Dashboard / Overview** | "What is the current health/state and what needs attention next?" | High-level status cards + explicit drill-down entry points (`View all →`) | Dumping entire tables, huge historical logs, or complex forms directly on the dashboard. |
| **Catalog / List Ledger** | "What items exist and what are their key attributes?" | Searchable, filterable table/grid with pagination and primary row actions | Missing search/filters, rendering unbounded 10,000 items without pagination or virtual scrolling. |
| **Detail Workspace** | "What is the full state of this entity and what actions can I take?" | Clear header with entity status badge + focused tabs/sections | Forcing users to leave context or open 5 separate modals to view linked records. |
| **Focused Workflow / Form** | "What am I submitting/completing and what are the required steps?" | Linear, stepped inputs with clear validation feedback and explicit submit CTA | Cluttering the viewport with unrelated sidebars, marketing banners, or navigation jumps. |
| **Operational Tool (Scanner / POS)** | "Is this item/code valid and what is the immediate action?" | High-contrast status indicator + rapid scan/submit input | Multi-column clutter, small fonts, or slow multi-step confirmation modals. |

---

## 2. Desktop Layout & Container Ergonomics

### 2.1 Avoid "Glued Content"
In desktop layouts with navigation sidebars, content must never stick directly to the edge of the sidebar without intentional horizontal and vertical padding.

```text
┌──────────────┬────────────────────────────────────────────────────────────────────────┐
│ Navigation   │                           Main Workspace                               │
│ Sidebar      │   [Padding: 1.5rem to 2.5rem / 24px to 40px]                           │
│              │   ┌────────────────────────────────────────────────────────────────┐   │
│              │   │                  Max-Width Content Container                   │   │
│              │   │                  (e.g., max-w-5xl/7xl mx-auto)                 │   │
│              │   │                                                                │   │
│              │   │   [Header: Hierarchy → Title → Contextual Primary CTA]         │   │
│              │   │   [Structured Content Grid / Data Presentation]                │   │
│              │   └────────────────────────────────────────────────────────────────┘   │
└──────────────┴────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Content-Driven Max-Widths
Never force every screen into `width: 100%`. Tailor the container width to the cognitive density of the page:
- **Focused Forms & Single-Column Steps:** Narrow container (`~640px - 840px`). Prevents line lengths from exceeding 75 characters, maximizing reading comprehension.
- **Reading / Feed / Discussions:** Centered column (`~680px - 768px`).
- **Dashboard / Operational Overviews:** Medium-wide container (`~1140px - 1280px`).
- **High-Density Tabular Ledgers:** Wide container (`~1360px - 1440px` or responsive fluid width with sticky table headers).

---

## 3. Visual Restraint (Eliminating Generic AI UI Tropes)

- ❌ **Card-in-Card Soup:** Wrapping every single paragraph, label, and list item inside nested white boxes with heavy box-shadows (`[Card [Card [Card]]]`).
- ❌ **Symmetrical 4-KPI Grids:** Blindly rendering 4 equal-sized cards with giant numbers for metrics of vastly different operational importance.
- ❌ **Oversaturated Neon Gradients:** Artificial glowing purples, blues, and heavy glassmorphism on utilitarian business tools.
- ❌ **Redundant Actions:** Displaying 2-3 buttons with different labels for the exact same action in the same viewport.
- ✅ **Mature Structural Design:**
  - Content $\to$ Structure $\to$ Interaction $\to$ Decoration.
  - Use subtle 1px border dividers, intentional whitespace, and clear typography hierarchy instead of endless cards.
  - Restrained border-radius: subtle radius for cards/panels (`8px - 12px`), compact radius for controls (`6px - 8px`), full pill (`9999px`) reserved for status badges.

---

## 4. Accessibility (a11y) Baseline

Every web and mobile interface must satisfy:
1. **Semantic Structure:** Use native `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<button>`, and `<a>` elements. Never use `<div onClick={...}>` when a native `<button>` or `<a>` is appropriate.
2. **Keyboard Navigation:** All interactive elements must have visible focus indicators (`:focus-visible`) and be reachable via `Tab` / `Shift+Tab`.
3. **Form Accessibility:** Every `<input>` must have an associated `<label>` (via `htmlFor` / `for` or wrapping label) and `aria-invalid` / `aria-describedby` when validation errors exist.
4. **Color Contrast:** Text and actionable icons must meet WCAG AA contrast ratio ($\ge 4.5:1$ for normal text, $\ge 3:1$ for large text and UI controls).
5. **Modal & Dialog Focus Trap:** Modals and drawers must trap focus while open, close on `Escape`, and return focus to the trigger element upon closing.
