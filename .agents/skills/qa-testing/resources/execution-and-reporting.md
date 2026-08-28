# Test Execution, Diagnosis & Defect Reporting

> Project-agnostic guidelines for running test suites, diagnosing failures accurately, and generating actionable reports.

---

## 1. Running Test Suites

1. **Discover & Execute via Project CLI:**
   - Node: `npm test` / `pnpm test` / `yarn test` / `npx vitest run` / `npx playwright test`
   - Python: `pytest` / `python -m unittest`
   - Go: `go test -v ./...`
   - Rust: `cargo test`
   - PHP: `./vendor/bin/phpunit`
2. **Observe Real Outputs:**
   - Always capture and read the actual CLI stdout/stderr output.
   - Never report test results based on hypothetical expectations.

---

## 2. Diagnosing Test Failures (Root Cause Triage)

When a test fails, classify the failure into one of 3 distinct categories before proposing changes:

```text
                                Test Failed
                                     ↓
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
[ A. True Code Bug ]       [ B. Outdated/Wrong Test ]   [ C. Environment / Flake ]
The code violated the      The test made invalid        Network timeout, database
contract or crashed on     assumptions or outdated      port collision, or stale
a valid test payload.      schema assertions.           fixture state.
       ↓                            ↓                            ↓
Report bug & recommend     Update test assertion to     Fix environment setup /
fix in backend/frontend.   match valid business logic.  isolate test state.
```

---

## 3. Reporting Standards

Every test run report must include:
1. **Execution Metric:** Tests passed, failed, skipped, and total duration.
2. **Failure Trace:** The exact failure message, expected value vs actual value.
3. **Reproduction Payload:** The minimal input to reproduce the failure.
4. **Impact Assessment:** Functional severity (Critical/High/Medium/Low).
