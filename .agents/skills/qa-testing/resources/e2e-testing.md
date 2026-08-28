# Browser & UI End-to-End Testing

> Project-agnostic guidelines for browser automation, UI critical-path verification, and resilient selectors.

---

## 1. Role of E2E Testing in the QA Strategy

Browser E2E tests are high-fidelity but computationally expensive and prone to timing flakiness if poorly written. Use E2E tests for:
- The **golden user flow** (e.g. Landing $\to$ Register $\to$ Complete Order $\to$ View Confirmation).
- Complex multi-step UI wizards (e.g. Multi-step checkout with form validation).
- File upload widgets and drag-and-drop interactions.

*Do not test 50 different input validation error variations through the browser; verify boundary variations via API tests.*

---

## 2. Resilient Selector & Interaction Principles

1. **User-Facing & Accessible Selectors:**
   - Prefer finding elements by role and accessible name: `getByRole('button', { name: /submit/i })`, `getByLabelText('Email')`, `getByText('Order confirmed')`.
   - Avoid brittle CSS selectors tied to styling (`.btn-primary-v2 > div:nth-child(3)`).
   - Use explicit test IDs (`data-testid="order-submit-btn"`) where accessible names are ambiguous.
2. **Auto-Waiting over Fixed Sleep:**
   - Never use arbitrary sleep timers (e.g. `sleep(3000)`).
   - Use assertions that automatically poll until state resolves: `expect(locator).toBeVisible()`, `expect(locator).toHaveText(...)`.
3. **Clean Session State:**
   - Use browser contexts/incognito profiles so tests do not inherit stale cookies, local storage, or session state from previous test runs.
