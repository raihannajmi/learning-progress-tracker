# Test Data, Fixtures & Environment Seeding

> Project-agnostic guidelines for test database isolation, deterministic fixtures, and cleanup discipline.

---

## 1. Environment & Database Isolation

1. **Never Run Destructive Tests Against Production or Dev:**
   - Verify connection strings before executing test migrations or teardowns.
   - The test environment must point to an isolated database (e.g. `dbname_test`, in-memory SQLite, or ephemeral Docker test container).
2. **Deterministic Data State:**
   - Every test run must start from a known baseline.
   - Seed baseline lookup tables (roles, status enums, master categories) during test suite initialization.

---

## 2. Factories vs Hardcoded Fixtures

- **Factory Pattern:** Create helper functions that generate entity objects with random unique suffixes (e.g. `user_${Date.now()}@example.com`) and sensible defaults, allowing individual tests to override only the fields relevant to their scenario:
  ```typescript
  export function createTestUser(overrides = {}) {
    return {
      email: `user_${Math.random().toString(36).substring(7)}@test.local`,
      name: "Test User",
      role: "CUSTOMER",
      ...overrides,
    };
  }
  ```
- **Avoid Global Shared Mutables:** If Test A modifies User #1, Test B should not rely on User #1 being in its original state. Generate fresh entities per test case.

---

## 3. Teardown & Cleanup Discipline

- Clean up created entities in `afterAll` / `afterEach` hooks, or wrap tests in rollback transactions where the testing framework supports it.
- Ensure teardowns do not fail silently or block subsequent test execution.
