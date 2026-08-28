# Client-Side Performance, Security Hygiene & Anti-Overengineering

> Project-agnostic guidelines for runtime profiling, bundle hygiene, client security boundaries, and anti-overengineering rules in frontend systems.

---

## 1. Runtime Performance & Re-render Economics

### 1.1 First-Principles Performance Inquiries
Before recommending any performance refactoring (e.g. `useMemo`, `useCallback`, component splitting, virtualization), ask:
1. **Is there a measurable performance degradation?** (e.g. Frame drops < 60fps, interaction lag > 100ms, large layout shifts).
2. **What is causing the work?** (Expensive mathematical calculation, massive DOM tree > 2,000 nodes, or unoptimized images).
3. **Is the memoization overhead heavier than the calculation itself?** (Wrapping a 2-line string concatenation in `useMemo` is slower than letting it re-compute).

### 1.2 Common Real-World Performance Hotspots
- **Large Lists:** If rendering > 100 complex DOM rows, consider virtualized lists (`windowing`) only when normal pagination is insufficient for the use case.
- **Image Optimization:** Ensure explicit `width`, `height`, and modern formats (`webp`/`avif`) with `loading="lazy"` on below-the-fold assets to prevent Cumulative Layout Shift (CLS).
- **Bundle Splitting:** Lazy-load heavy route components or rarely used modals (e.g. PDF viewer, complex chart library) rather than bundling them into the main entry bundle.

---

## 2. Client-Side Security Hygiene

Although the server is the ultimate security boundary, frontend code must maintain strict client-side hygiene:

### 2.1 DOM-Based Cross-Site Scripting (DOM XSS)
- **Danger Zones:** `dangerouslySetInnerHTML`, `v-html`, `innerHTML`, `document.write`, `eval()`, `href="javascript:..."`.
- **Rule:** If rich text / HTML rendering is mandatory, sanitize using a proven sanitizer (e.g. DOMPurify) before rendering.
- **URI Sanitization:** Always validate URLs rendered in `<a href={url}>` to ensure protocols are restricted to `https://`, `http://`, or `mailto:`. Disallow `javascript:` or `data:text/html`.

### 2.2 Sensitive Data in Client Storage
- **Local Storage / Session Storage:** Accessible to ANY JavaScript running on the page (including third-party analytics, ads, and compromised npm packages).
- **Rule:** Never store high-privilege permanent secrets, private encryption keys, or unencrypted sensitive PII in `localStorage`.
- **Auth Tokens:** Prefer HTTP-only, secure, same-site cookies for session tokens where feasible. If storing short-lived access tokens in memory / local storage, acknowledge the trade-off and ensure short TTLs with strict XSS defenses.

---

## 3. Anti-Overengineering Guardrails in Frontend

Frontend code is particularly vulnerable to fashion-driven overengineering. Enforce these strict boundaries:

1. **No Premature Custom Hook Extraction:**
   - Writing a 10-line `useToggle` or `useFetchData` custom hook for a single component introduces layer indirection without benefit.
   - Keep logic inline inside the component until it is genuinely reused across 3 distinct places.
2. **No Arbitrary Component Fragmentation:**
   - Splitting a 150-line form into 8 separate component files (`FormHeader.tsx`, `FormFieldContainer.tsx`, `FormSubmitSection.tsx`, `FormFooter.tsx`) increases boilerplate and prop-drilling.
   - Group related sub-sections in the same file or keep them inline until they represent independent, reusable abstractions.
3. **No Unrequested State Management Libraries:**
   - If the application is a standard CRUD app with straightforward routing, do NOT introduce complex state management libraries (Redux Toolkit, Zustand, MobX, RxJS) when native component state + URL search params suffice.
4. **Preserve Working Code (The Working Diff Rule):**
   - Do not refactor existing, bug-free components just to change formatting, variable naming, or switch between functional/class styles.
   - The shortest working diff that solves the actual bug or implements the requested feature always wins.
