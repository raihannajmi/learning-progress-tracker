# Browser End-to-End (E2E) Test Playbook (Playwright & Cypress)

> Practical, code-level guide for authoring, structuring, and running end-to-end browser automation suites with Page Object Models, visual locators, and auth state injection.

---

## 1. Playwright Architecture & Best Practices

### 1.1 Page Object Model (POM) Structure
```typescript
// e2e/pages/CheckoutPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly ticketQtySelect: Locator;
  readonly submitButton: Locator;
  readonly qrImage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByLabel(/Nama Lengkap/i);
    this.emailInput = page.getByLabel(/Email/i);
    this.phoneInput = page.getByLabel(/Nomor WhatsApp/i);
    this.ticketQtySelect = page.getByRole('spinbutton', { name: /Jumlah Tiket/i });
    this.submitButton = page.getByRole('button', { name: /Bayar Sekarang|Konfirmasi/i });
    this.qrImage = page.locator('img[alt*="QRIS"]');
  }

  async goto(eventSlug: string) {
    await this.page.goto(`/events/${eventSlug}`);
  }

  async fillBuyerInfo(name: string, email: string, phone: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async submitOrder() {
    await this.submitButton.click();
  }

  async expectPaymentScreenVisible() {
    await expect(this.qrImage).toBeVisible({ timeout: 10000 });
  }
}
```

### 1.2 Full Critical-Path E2E Spec
```typescript
// e2e/specs/checkout-flow.spec.ts
import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../pages/CheckoutPage.js';

test.describe('Ticket Purchase & Payment Flow', () => {
  test('Complete guest checkout and see payment QR', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);

    // 1. Visit event page
    await checkoutPage.goto('konser-musik-2026');

    // 2. Select ticket category & fill details
    await checkoutPage.fillBuyerInfo('Raihan Test', 'raihan@test.local', '081234567890');

    // 3. Submit checkout
    await checkoutPage.submitOrder();

    // 4. Assert URL redirected to order summary and payment QR is displayed
    await expect(page).toHaveURL(/.*\/orders\/EV-.*/);
    await checkoutPage.expectPaymentScreenVisible();
  });

  test('Shows validation error when required buyer email is invalid', async ({ page }) => {
    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.goto('konser-musik-2026');

    await checkoutPage.fillBuyerInfo('Raihan Test', 'invalid-email-string', '081234567890');
    await checkoutPage.submitOrder();

    // Expect inline error
    await expect(page.getByText(/Format email tidak valid/i)).toBeVisible();
  });
});
```

---

## 2. Pre-Authenticated Session Injection (Fast E2E Runs)

Avoid logging in through the UI for every single admin test case. Save authentication state once in `setup`:

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/Email/i).fill('admin@evenda.test');
  await page.getByLabel(/Password/i).fill('password123');
  await page.getByRole('button', { name: /Masuk/i }).click();

  await page.waitForURL('/dashboard');
  await expect(page.getByText(/Dashboard/i)).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```
