# Flow Mapping & Adversarial Test Planning

> Project-agnostic guidelines for mapping business flows, state transitions, and actor boundaries into structured test plans.

---

## 1. Flow Discovery: Tracing the Real User Journey

Before writing a single test script, map the complete workflow from start to finish:

1. **Identify the Actors:** Who are the participants? (e.g., Unauthenticated visitor, Authenticated customer, Tenant admin, Platform superadmin).
2. **Identify the States & Transitions:**
   - Draft $\longrightarrow$ Submitted $\longrightarrow$ Under Review $\longrightarrow$ Approved $\longrightarrow$ Completed
   - Draft $\longrightarrow$ Submitted $\longrightarrow$ Rejected $\longrightarrow$ Resubmitted
   - What triggers each transition? Who is authorized to trigger it?
3. **Identify Data Preconditions & Side-Effects:**
   - Preconditions: What records must exist beforehand (e.g. Verified account, active event, available quota)?
   - Side-Effects: What must change in persistence or third-party systems (e.g. Stock decremented, email notification sent, audit log written)?

---

## 2. The Adversarial Test Matrix

Construct an ordered test matrix with both happy path and adversarial/negative tests:

| Step # | Actor | Action / Request | Precondition / State | Expected Result | Scenario Type |
|---|---|---|---|---|---|
| **1.0** | User A | `POST /auth/login` | Valid credentials | `200 OK`, Auth token | Happy Path |
| **1.1** | User A | `POST /auth/login` | Invalid password | `401 Unauthorized` | Negative: Bad Credential |
| **2.0** | User A | `POST /items` | Valid body | `201 Created`, ID returned | Happy Path |
| **2.1** | User A | `POST /items` | Missing required fields | `400 Bad Request` | Negative: Schema Validation |
| **2.2** | Anonymous | `POST /items` | Valid body | `401 Unauthorized` | Negative: Auth Guard |
| **3.0** | User A | `POST /items/:id/submit` | State = `DRAFT` | `200 OK`, State = `SUBMITTED` | State Transition |
| **3.1** | User A | `POST /items/:id/submit` | State = `SUBMITTED` | `409 Conflict` (Already submitted) | Adversarial: Re-trigger |
| **4.0** | User B (Non-owner)| `GET /items/:id` | State = `SUBMITTED` | `403 Forbidden` / `404 Not Found` | Adversarial: IDOR / Isolation |
| **5.0** | Admin | `POST /items/:id/approve` | State = `SUBMITTED` | `200 OK`, State = `APPROVED` | State Transition |
| **5.1** | User A (Non-admin)| `POST /items/:id/approve` | State = `SUBMITTED` | `403 Forbidden` | Adversarial: Privilege Escalation |

---

## 3. Selecting Test Granularity

- **API Integration Tests:** Primary workhorse. Fast, deterministic, covers business rules, validation schemas, and database transitions without UI rendering overhead.
- **Browser / UI E2E Tests:** Reserved for critical-path smoke testing (e.g. Can a user actually navigate the UI, fill the form, click submit, and see the confirmation screen?).
- **Unit / Pure Logic Tests:** For complex mathematical algorithms, parsing logic, and financial calculations.
