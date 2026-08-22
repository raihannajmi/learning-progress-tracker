# Summary 02: Frontend Architecture & End-to-End System Completion

**Date:** 2026-08-22  
**Status:** Completed & 100% Verified  
**Stack:** TanStack Router, React 19, Tailwind CSS v4, Zustand, Formik, Yup, TanStack Query, Axios, Lucide React, Google OAuth.

---

## 1. Frontend Architecture & State Management

1. **Routing & Structure (TanStack Router):**
   - `/`: Google OAuth Login & Onboarding view + instant whitelisted demo switcher.
   - `/dashboard`: Student Dashboard (This Week Focus, Self-Assessed Progress per Category, Next Action CTA, Recent Sprints).
   - `/roadmap`: 8-Week Syllabus & interactive 4-State Self-Assessment Checklists.
   - `/sprints`: Personal Sprint Logger with built-in 25-minute habit timer & reflections history.
   - `/class`: Class-wide social accountability feed with peer evidence & qualitative feedback.
   - `/admin`: TA & Dosen Monitoring Dashboard (Active student count, Common Confusion aggregator, Inactive student filter).
   - `/admin-students`: Admin Whitelist Management (Single add & Batch CSV import).

2. **Global Client State (Zustand):**
   - Store: `src/stores/authStore.ts`
   - Handles JWT token persistence, active user profile, role verification, and logout.

3. **Server State & Caching (TanStack Query):**
   - Keys: `['roadmap']`, `['studentDashboard']`, `['adminDashboard']`, `['sprints']`, `['classes']`, `['adminStudents']`.
   - Optimistic invalidations on sprint creation, checklist state updates, and peer feedbacks.

4. **Forms & Input Validation (Formik + Yup):**
   - `SprintModal.tsx`: Duration (min 1m, habit indicator at $\ge$25m), What Learned, What Practiced, Confusing reflection, Evidence URL & Type.
   - `PeerFeedbackCard.tsx`: Constructive feedback composer.
   - `admin-students.tsx`: Single student whitelist form & Batch CSV parser.

---

## 2. Design System & Ergonomics Standards

- **Typography:** High-contrast sans-serif hierarchy (Inter) with `font-mono` for NIM, codes, and durations.
- **4-State Checklist Indicators:**
  - `NOT_STARTED`: `○ Belum Mulai` (slate badge)
  - `LEARNING`: `◐ Mempelajari Konsep` (sky badge)
  - `PRACTICING`: `◐ Sedang Berlatih` (amber badge)
  - `CAN_DO_INDEPENDENTLY`: `✓ Bisa Mandiri` (emerald badge)
- **Habit Indicators:**
  - $\ge$25m: `🎯 ≥25m Habit Target Reached`
  - <25m: `⏱️ {duration}m (<25m target)`
- **Neutral Language Guard:** No shame labels ("LAZY" / "FAILED" are strictly prohibited per PRD §25.5; neutral labels like "Belum ada aktivitas minggu ini" used).

---

## 3. Verification & Build Checks

- **Backend Typecheck & Build:** `pnpm build` $\rightarrow$ Exit 0.
- **Frontend Typecheck & Vite Build:** `pnpm build` $\rightarrow$ Exit 0 (SSR & Client bundles generated).
- **Backend API & Logic Tests (`src/test-api.ts`):** 9/9 suites passed with 100% success.
