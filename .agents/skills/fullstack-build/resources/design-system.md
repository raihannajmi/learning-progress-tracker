# UI Design System Reference (typography, icons, layout, responsive, catalog UI, forms)

> Loaded when building/reviewing visual design details — typography scale, icon sizing, responsive breakpoints, layout ergonomics, catalog/filter UI, and form action patterns.

# Typography & Icon Design System Standard

This skill establishes the visual hierarchy, font-family setup, font-weight balance, and icon proportions across all frontend pages and components.

---

## 1. Font Family System

### Primary UI Font
Choose a clean, modern geometric or humanist sans-serif with high x-height
and optical legibility — appropriate for dashboards, data tables, and
complex forms. Configure it in `tailwind.config.js` as `font-sans` with
a `<link>` or `@font-face` import in the HTML head.

**Good choices:** Inter, Plus Jakarta Sans, DM Sans, IBM Plex Sans.
**Avoid for UI:** Display/decorative fonts, variable fonts without
subsetting (they balloon bundle size), fonts with poor numeral
distinction at small sizes.

### Monospace Font (Codes & Financial Data)
Use a dedicated monospace font for:
- Entity/record codes (e.g. `PRD-001`, `INV-0042`)
- Invoice numbers and contract identifiers
- Table row IDs and financial calculations
- Any value where character-for-character alignment matters

**Good choices:** JetBrains Mono, Fira Code, IBM Plex Mono, Roboto Mono.
Apply as `font-mono` in Tailwind, falling back to `ui-monospace, monospace`.

---

## 2. Typography Hierarchy & Weight Distribution

### ⚠️ Anti-Bloat Rule (No `font-black` Everywhere)
- **Forbidden:** Overusing `font-black` (900) on standard badges, labels, or card text. Overly heavy weights create muddy visual noise and reduce optical readability.
- **Standard Distribution:**
  - `font-bold` (700): Page titles (H1), major metric numbers, primary CTA buttons.
  - `font-semibold` (600): Section headers (H2), card titles (H3), form labels, table column headers, and status badges.
  - `font-medium` (500): Secondary details, helper notes, metadata timestamps, table cell text.
  - `font-normal` (400): Long-form descriptions, notes, and paragraphs (`leading-relaxed`).

### Standard Typography Scale

| Hierarchy | Tailwind Classes | Usage |
| :--- | :--- | :--- |
| **Page Title (H1)** | `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900` | Main view header |
| **Section Title (H2)** | `text-base sm:text-lg font-bold tracking-tight text-slate-800` | Sub-sections, Chart headers |
| **Card Header (H3)** | `text-sm sm:text-base font-semibold text-slate-900` | Modal titles, Card titles |
| **KPI Big Number** | `text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight` | Metric numbers |
| **Body Text** | `text-xs sm:text-sm font-normal text-slate-600 leading-relaxed` | General descriptions |
| **Form Labels** | `text-xs font-semibold text-slate-700` | Input & dropdown labels |
| **Table Header** | `text-[11px] font-semibold text-slate-500 uppercase tracking-wider` | Table columns |
| **Status Badge** | `text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full` | Status indicators |
| **Captions / Timestamps** | `text-xs text-slate-400 font-medium` | Created dates, subtitles |
| **Entity Code** | `font-mono text-xs font-semibold uppercase tracking-wider` | Asset & invoice codes |

---

## 3. Lucide SVG Icon Proportions & Alignment

### Icon Sizing Guidelines

```text
┌───────────────────────────┬────────────┬───────────────────────────────────────┐
│ Context                   │ Icon Size  │ Container / Wrapper                   │
├───────────────────────────┼────────────┼───────────────────────────────────────┤
│ Micro Badges & Status     │ size={12}  │ inline-flex items-center gap-1        │
│ Buttons & Action Links    │ size={14}  │ inline-flex items-center gap-1.5      │
│ Inputs & Search Bars      │ size={16}  │ pl-9 or absolute left-3               │
│ Section & Card Headers    │ size={18}  │ p-2 bg-blue-50 text-blue-600 rounded  │
│ KPI Metric Icons          │ size={20}  │ p-2.5 bg-indigo-50 text-indigo-600    │
│ Empty States & Hero Plugs │ size={36}  │ mx-auto text-slate-300 mb-2           │
└───────────────────────────┴────────────┴───────────────────────────────────────┘
```

### Optical Rules:
1. **Vertical Centering:** Always wrap inline icons and text with `inline-flex items-center gap-1.5` to prevent text-baseline misalignment.
2. **Never raw emojis:** Use `<CheckCircle2 />`, `<Wrench />`, `<XCircle />`, `<Clock />`, `<CalendarClock />` instead of raw unicode strings.
3. **Muted Icon Colors for Inputs:** Use `text-slate-400` inside inputs so icons do not compete with user-typed text.

---

# Responsive Viewport Ergonomics

Reviews and fixes how a UI adapts across viewport sizes — ensuring the
layout is correct, usable, and ergonomically appropriate at every
breakpoint, not just desktop.

---

## 0. Discovery

Before auditing:

1. What is the CSS framework in use (Tailwind CSS, CSS modules, plain
   CSS)? What are the configured breakpoints?
2. What viewport sizes are in scope — mobile only, mobile+tablet,
   all three? What device profiles do actual users use?
3. Is this a public-facing page, an admin panel, or both? (Different
   ergonomic priorities apply.)
4. Are there any existing responsive issues already reported by the user?

---

## 1. Breakpoint Audit

For each key page/component, verify behavior at:

| Breakpoint | Typical width | What to check |
|---|---|---|
| Small mobile | 320px–375px | Does anything overflow horizontally? Is text still readable? |
| Standard mobile | 376px–480px | Navigation collapsed? Touch targets large enough? |
| Tablet portrait | 481px–768px | Does the layout switch to appropriate column count? |
| Tablet landscape | 769px–1024px | Not purely desktop — sidebar still manageable? |
| Desktop | 1025px+ | Full layout — check for runaway max-width on content columns |

**Anti-pattern:** Testing only at exactly 375px and 1440px and calling it
responsive. The real breakage happens at the transitions between.

---

## 2. Navigation Pattern Correctness

The navigation pattern must match the viewport:

| Pattern | Appropriate for |
|---|---|
| Persistent sidebar (always visible) | Desktop only (≥1025px) |
| Collapsible sidebar (hamburger reveal) | Tablet (≥768px) |
| Hamburger menu (off-canvas drawer) | Mobile (<768px) |
| Bottom tab bar | Mobile-native apps, PWAs |

**Flag:** A persistent sidebar that occupies 280px at 768px tablet
portrait — the remaining content width is too narrow for most data
tables and forms.

**Flag:** A hamburger menu that's still hamburger at 1280px desktop —
wasted navigation space, users expect to see the nav without clicking.

---

## 3. Touch Target Sizing

- Minimum interactive touch target: **44px × 44px** (Apple HIG) or
  **48dp × 48dp** (Material Design). Flag anything below 36px.
- Icon-only buttons on mobile must have explicit `min-h-[44px]
  min-w-[44px]` even if the visible icon is smaller.
- Spacing between adjacent interactive elements: at least 8px to prevent
  accidental taps.

---

## 4. Overflow & Clipping

- [ ] No horizontal scroll on mobile (`overflow-x: hidden` on body is a
      red flag that something else is wrong — find the actual overflow
      source and fix it there).
- [ ] Data tables: do they have `overflow-x: auto` on a wrapper, or do
      they clip/break the layout?
- [ ] Long text strings (URLs, email addresses, code): do they truncate
      or wrap correctly?
- [ ] Modals and drawers: do they respect viewport height on mobile
      (`max-h-[100dvh]`, not `100vh` which doesn't account for mobile
      browser chrome)?

---

## 5. Font Scaling

- Body text: minimum 14px on mobile for comfortable reading. 12px is
  acceptable only for metadata/captions.
- Line length: 45–75 characters per line is optimal. On desktop, wide
  full-width text columns are uncomfortable to read — constrain with
  `max-w-prose` or similar.
- Responsive text scaling: if using `text-sm sm:text-base` or similar
  Tailwind utilities, verify every breakpoint renders a readable size.

---

## 6. Layout Reflow Correctness

- Grid/flexbox layouts: at each breakpoint, do columns collapse in a
  logical reading order? (`order` manipulation in CSS can cause confusing
  tab order on mobile.)
- Cards and list items: on mobile they should typically be single-column,
  not two-column with tiny content.
- Forms: input fields on mobile should be full-width. Never two-column
  form inputs on a 375px screen.

---

## 7. Output Format

Write findings to `responsive-audit-<screen>-<date>.md`:

```md
# Responsive Audit: <Screen/Component>

## Findings

[P0] <Component>: <breakpoint> — <issue>
File: <path:line>
At: <viewport width where issue appears>
Problem: <what breaks>
Fix: <Tailwind class or CSS change>

## Breakpoint Checklist
- [ ] 320px: no horizontal overflow
- [ ] 375px: touch targets ≥ 44px
- [ ] 768px: navigation pattern appropriate
- [ ] 1024px: layout columns balanced
- [ ] 1440px: max-width constrains content width
```

"stop responsive-viewport-ergonomics" or "normal mode": revert to normal behavior.

---

# UI Layout & Ergonomics Audit

Audits screen layouts for visual balance, asymmetric vertical stretching,
unbounded list growth, and ergonomic readability.

## 1. Ergonomic Audit Dimensions

### A. Column Height Symmetry & Infinite Scroll Prevention
- **Anti-pattern:** One column (e.g. sidebar or activity log) stretches to 2,000px+ while the adjacent column finishes at 600px, creating massive dead whitespace.
- **Rule:** Any dynamic list (status history, comments, activity feed, audit trail) with more than 4 potential items **MUST** have:
  1. Default preview limit (e.g. show 3–4 most recent items).
  2. Interactive expand/collapse toggle ("Show all (N)" / "Collapse").
  3. Bounded height container with internal scroll (`max-h-[300px] overflow-y-auto pr-1`).


### B. Vertical Rhythm & Zebra Banding Elimination
- **Anti-pattern:** Stacking multiple contrasting horizontal bands inside a single card (e.g. gray header + white body + gray mid-section + gray footer), creating high-contrast striations that tire the eyes.
- **Rule:** A card must be a unified container with subtle dividers (`border-slate-100` or minimal spacing), reserving contrasting backgrounds only for explicit status callouts (e.g. alert banners).

### C. Information Density & Scannability (8pt Modular Grid)
- Check font size hierarchy:
  - Page Titles (H1): 24px (`text-2xl font-bold`)
  - Section Headers (H2): 16px–18px (`text-base` to `text-lg font-bold`)
  - Primary Entity Values: 14px–15px (`text-sm` to `text-[15px] font-semibold`)
  - Supporting Text: 12px–13px (`text-xs` to `text-[13px] text-slate-500`)
  - Micro-labels: 10px–11px uppercase tracking-wider (`text-[10px]` to `text-[11px] font-semibold text-slate-400`)

### D. Touch Target & Accessibility Compliance (WCAG)
- Primary and secondary interactive controls must maintain a minimum touch target of 36px–44px (`min-h-[36px]` or `py-2 px-3.5`).
- Ensure accessible contrast between text and background tokens (`slate-900`/`slate-800` on white; avoid low-contrast `slate-300`/`slate-400` on primary labels).

---

## 2. Review Output Format

Write findings to `frontend-layout-audit-<screen>-<date>.md`:

```markdown
# UI Layout & Ergonomics Audit: <Screen Name>

## 1. Asymmetry & Vertical Height Findings
[Severity] <Component>: <Description of stretching or layout imbalance>
- File: <path:line>
- Metric: Left Column (<Height>px) vs Right Column (<Height>px)
- Recommendation: <Bounded container / collapsible toggle fix>

## 2. Visual Banding & Density Findings
[Severity] <Component>: <Zebra banding or density violation>
- Recommendation: <Consolidated card markup>

## 3. Checklist Compliance
- [ ] Bounded dynamic lists with overflow containment
- [ ] Column height ratio balanced within 1:1.5
- [ ] 0 Dead whitespace in desktop split layout
- [ ] Standardized typography hierarchy (24px -> 14px -> 11px)
```

---

# Catalog UI/UX Design & Faceted Filter Audit

This skill governs the visual design, information ergonomics, and interaction patterns of public and internal catalog browsing pages (Assets, Facilities, Products, Services, Orders).

---

## 1. Core Principles of Premium Catalog UX

### Rule 1: Zero-Count Entity Suppression (Anti-Dead-Pills)
* **Never display dead filter pills with count `0`** in consumer/public catalog views (e.g. `Kantin (0)`, `Olahraga (0)`).
* Only render category and location pills that have **at least 1 available item** (`count > 0`), or dynamically compute counts from currently active datasets.
* Showing pills with `(0)` confuses users, wastes horizontal viewport space, and leads to dead clicks.

### Rule 2: Scrollbar Hygiene & Container Ergonomics
* **Never let raw, thick OS/browser scrollbars cut across filter pills**.
* Apply `overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` (Tailwind `no-scrollbar` pattern) with subtle edge fade masks or smooth button carousels.
* For multi-dimensional filters (Category + Location + Price + Capacity), provide compact responsive pill bars or elegant dropdown selects rather than multiple stacked horizontal scrollbars.

### Rule 3: Single-Glance Card Hierarchy
Every catalog card must communicate 4 core dimensions within 200ms of visual scanning:
1. **Hero Visual**: 16:10 or 16:9 crisp aspect ratio with subtle zoom on hover and badge overlays (Status, Category, Code).
2. **Identitas & Lokasi**: Clear primary title with building badge (e.g. `🏛️ Kantin Pusat BPU`) and room detail (`Lantai 1 - Stand A1`).
3. **Kapasitas & Fasilitas**: Icon + concise capacity text (`👥 30 Orang`) + facility tags.
4. **Pricing & Primary CTA**: Clear base price (`Rp 3.500.000 / Bulan`) + prominent booking/detail button.

---

## 2. Standard Faceted Filter Architecture (React + Tailwind)

```jsx
// Pattern for Zero-Count Suppression in Catalog Filters
const activeCategories = categories.filter(cat => {
  const count = availableAssets.filter(a => String(a.categoryId) === String(cat.id)).length;
  return count > 0;
});

const activeLocations = locations.filter(loc => {
  const count = availableAssets.filter(a => String(a.locationId) === String(loc.id)).length;
  return count > 0;
});
```

---

## 3. Checklist for Catalog Reviews

- [ ] Are categories with `0` assets hidden from public view?
- [ ] Are ugly gray horizontal scrollbars removed using `no-scrollbar`?
- [ ] Is there an active filter indicator with a 1-click "Reset Semua Filter" button?
- [ ] Do search inputs have instant debounce and a clear button (`Hapus`)?
- [ ] Are card images lazy-loaded with fallback icons when no photo exists?
- [ ] Is the layout responsive and balanced on mobile (1-column), tablet (2-columns), and desktop (3-columns)?

---

# Form Action & CTA Design Audit

Audits and standardizes Call-To-Action (CTA) buttons, sticky action bars,
and submission ergonomics across forms.

## 1. Core Form Action Principles

### A. Single Authoritative Action Location (Anti-Redundancy)

**Anti-pattern:** Two different submit buttons on the same screen with
divergent copy (e.g. `Save` in the top header AND `Save All Changes` at
the bottom). This creates cognitive friction and uncertainty about which
button does what.

**Standard:** Use a single, prominent, accessible action cluster:

- **Pattern 1 — Sticky Top Header (recommended for large forms):** Keep
  `[Cancel]` and `[Save]` pinned at the top header (`sticky top-0`).
  User can submit without scrolling to the bottom after reviewing changes.
- **Pattern 2 — Sticky Bottom Bar:** Use for long linear single-column
  wizard-style forms where the action is the logical conclusion of
  scrolling through.

Never combine both patterns on the same screen.

### B. Concise & Predictable CTA Copy

**Rule:** Never use overly verbose labels. CTA copy should be the
*shortest phrase that unambiguously describes the action*. Adapt to your
project's language.

**Semantic patterns (adapt wording to project language):**

| Context | Primary CTA | Secondary CTA |
|---|---|---|
| Create mode | `[+ Add Entity]` or `[Save]` | `[Cancel]` |
| Edit mode | `[Save Changes]` | `[Discard]` or `[Cancel]` |
| Submitting | `[Saving... ⏳]` (disabled) | — |
| Destructive action | `[Confirm Delete]` | `[Cancel]` (prominent) |

**Never:** `Save All Current Changes to This Entity Right Now` — one
action, one verb, fewest words possible.

### C. Visual Hierarchy & Safety Guards

- **Primary CTA:** Solid primary brand color. Always `type="submit"` or
  explicit `onClick` handler.
- **Secondary / Cancel CTA:** Clean neutral border, no destructive color
  unless the action itself is destructive.
- **Disabled State:** Always `disabled={isSubmitting || isPending}` with
  visible disabled styling to prevent double-submitting duplicate records.
- **Confirmation Gate:** For irreversible actions (delete, terminate,
  reset), use an explicit confirmation step — either a modal or an
  in-place "type to confirm" pattern. Never make irreversible actions
  single-click.

### D. Form State Desynchronization Guard

- On "Edit" mode entry: take a snapshot of the initial form values.
- On "Cancel": if form is dirty (values differ from snapshot), prompt
  the user before discarding — don't silently lose edits.
- On navigation away: same guard — intercept with `beforeunload` or
  router's equivalent if the form is dirty.

"stop form-action-design-audit" or "normal mode": revert to normal behavior.
