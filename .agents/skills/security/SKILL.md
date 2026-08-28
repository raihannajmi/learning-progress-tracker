---
name: security
description: >
  Use this for ANY security architecture, threat modeling, defensive code review,
  trust boundary analysis, authentication/authorization hardening, cryptographic review,
  or vulnerability audit — across ANY technology stack (Node.js, Python, Go, Rust,
  Java, PHP, Ruby, Cloud/Container infra).
  Thinks like a defensive security engineer, analyzes trust boundaries from first principles,
  requires concrete evidence and exploit scenarios for findings, prevents security overengineering,
  and delivers pragmatic hardening blueprints.
  Trigger on "audit keamanan", "security audit", "cek celah keamanan", "hardening",
  "threat model", "apakah ini aman", "secure architecture", or /security.
---

# Defensive Security Engineering & Threat Modeling (Project-Agnostic)

A unified, evidence-driven security skill for conducting threat modeling, static security audits, cryptographic verification, and defensive code hardening across any language, framework, or infrastructure.

```text
resources/
├── security-checklist-owasp.md               Full audit workflow, OWASP Top 10 mapping, trust boundary discovery
├── authentication-session.md                 Password hashing, session lifecycles, JWT/OAuth2 flows, MFA
├── authorization-access-control.md           IDOR/BOLA, RBAC/ABAC boundaries, mass assignment, tenant isolation
├── injection-input-validation.md             SQLi, Command Injection, XSS, SSRF, Path Traversal, ReDoS
├── api-network-security.md                   CORS policies, Security Headers (CSP, HSTS), Rate Limiting, TLS
├── secrets-cryptography.md                   Secret management, key derivation, encryption at rest and in transit
├── file-upload-storage-security.md           Magic-byte verification, presigned uploads, storage permissions
├── frontend-client-security.md               DOM XSS mitigation, client-side token storage, postMessage security
├── dependency-infra-security.md              Dependency vulnerability scanning, Dockerfile least-privilege, CI/CD secrets
└── logging-monitoring-incident-response.md   Audit logging integrity, PII masking, incident detection
```

---

## 1. Purpose

To identify security vulnerabilities, evaluate threat models, design defensive controls, and provide actionable remediation blueprints. This skill conducts **defensive threat analysis and code audits** based on concrete code evidence and realistic exploitability, avoiding speculative vulnerability claims or security theater.

---

## 2. Scope

### In Scope
- **Threat Modeling & Trust Boundaries:** Identifying where untrusted input enters the system and where privilege transitions occur.
- **Authentication & Session Security:** Password hashing (Argon2, bcrypt, scrypt), session revocation, token verification, brute-force mitigation.
- **Authorization & Access Control:** Broken Object Level Authorization (BOLA/IDOR), Function Level Authorization (BFLA), tenant scoping.
- **Injection & Input Hygiene:** SQL/NoSQL injection, OS command injection, Cross-Site Scripting (XSS), Server-Side Request Forgery (SSRF), Path Traversal.
- **Cryptographic & Secret Protection:** Key generation, AES-GCM encryption, secret storage, avoiding hardcoded API tokens.
- **API & Network Defenses:** Cross-Origin Resource Sharing (CORS), Content Security Policy (CSP), rate limiting, error sanitization.
- **Infrastructure & Supply Chain:** Dependency vulnerability analysis, container security posture, CI/CD secret handling.

### Out of Scope
- Active black-box penetration testing and live offensive exploit execution $\to$ delegate to `pentest`.
- General feature development or database schema refactoring $\to$ delegate to `backend` or `frontend`.
- Functional QA regression testing $\to$ delegate to `qa-testing`.

---

## 3. When to Use

- When conducting a pre-launch or periodic security audit ("audit keamanan aplikasi ini").
- When reviewing a critical security-sensitive flow (authentication, password reset, payment callback, file upload).
- When investigating a specific vulnerability class (e.g. "Apakah endpoint ini rentan terhadap IDOR/SQLi?").
- When establishing secure coding baselines, CORS headers, or password hashing policies.
- When creating defensive hardening plans for identified security gaps.

---

## 4. When NOT to Use

- If the user wants to fire active exploit payloads or run non-destructive penetration probes against a live server $\to$ use `pentest`.
- If the task is fixing a frontend layout or writing standard UI components $\to$ use `frontend`.
- If the task is implementing general business logic or database queries $\to$ use `backend`.
- If the task is writing functional test suites $\to$ use `qa-testing`.

---

## 5. Initial Discovery (Phase 1: Zero Assumptions)

Before auditing, map the actual security architecture from source code:

1. **Map Trust Boundaries:**
   - Where does untrusted user input cross into the backend (HTTP routes, WebSocket messages, webhooks, file uploads)?
   - Where do privilege boundaries exist (Public $\to$ Authenticated User $\to$ Tenant Admin $\to$ Platform Superadmin)?
2. **Identify Security Mechanisms in Place:**
   - How is authentication handled (Session cookies, JWT Bearer tokens, OAuth2 / OIDC)?
   - Which password hashing algorithm is used?
   - How are database queries constructed (Parameterized ORM, Query builder, or Raw SQL strings)?
   - Is rate limiting configured at the gateway or application level?
3. **Inspect Infrastructure & Environment Variables:**
   - Are secrets loaded via environment variables or hardcoded?
   - What security headers are active?

> **Rule:** Never assume a vulnerability exists based solely on a function name or missing third-party library. Always verify whether the underlying mechanism is secure by design.

---

## 6. Context Understanding (Phase 2: Threat Modeling)

Analyze the realistic threat environment:
- **Attacker Profile:** Anonymous internet attacker, malicious authenticated tenant, rogue employee, compromised third-party vendor?
- **Asset Value:** Highly sensitive financial records, PII/HIPAA data, public read-only content?
- **Exposure:** Public-facing internet service, internal VPN tool, or CLI utility?

---

## 7. Analysis & Execution Methodology

Follow the disciplined **Reasoning Chain**:

$$\text{Observe} \longrightarrow \text{Understand} \longrightarrow \text{Hypothesize} \longrightarrow \text{Verify} \longrightarrow \text{Assess} \longrightarrow \text{Recommend}$$

### The 10 Inquiries for Every Security Finding
1. **What is observed in the source code?** (e.g. `db.query("SELECT * FROM users WHERE id = " + req.params.id)`).
2. **Where is the evidence?** (Exact file path, line numbers).
3. **What is the trust boundary crossed?** (Untrusted HTTP URL parameter interpolated into SQL query).
4. **What is the concrete exploit scenario?** (Attacker supplies `' OR 1=1 --` to dump entire user table).
5. **Is there any existing mitigating control?** (Is there a WAF, framework-level escaping, or upstream type coercion?).
6. **What is the verified exploitability?** (`CONFIRMED VULNERABILITY`, `LIKELY VULNERABILITY`, `POTENTIAL RISK`, or `HARDENING RECOMMENDATION`).
7. **What is the blast radius & impact?** (Confidentiality, Integrity, Availability).
8. **What is the confidence level?** (`CONFIRMED`, `PROBABLE`, or `POSSIBLE`).
9. **What is the simplest, most robust defensive fix?** (Parameterized query / ORM binding — shortest working diff).
10. **Does the proposed fix introduce operational regression?** (Verify performance and developer ergonomics).

---

## 8. Evidence Requirements

Every security finding MUST contain:
- **Exact Code Location:** `file:///path/to/controller.py#L42-L58`
- **Concrete Exploit Scenario:** A realistic step-by-step description of how an attacker abuses the gap.
- **Root Cause Vulnerability Class:** OWASP Top 10 / CWE mapping (e.g. `CWE-89: SQL Injection`, `CWE-639: IDOR`).

---

## 9. Critical Reasoning Rules & False-Positive Filters

Actively filter out false positives:
- **Absence of Specific Security Library $\neq$ Vulnerability:** A custom authentication middleware that correctly verifies signatures and expiry using standard crypto is NOT vulnerable simply because it doesn't use a specific npm/pip package.
- **Internal / Non-Sensitive Endpoints $\neq$ High Risk:** Missing rate limiting on a local health-check endpoint (`GET /health`) is NOT a High severity vulnerability.
- **Parameterized Raw SQL $\neq$ SQL Injection:** Using raw SQL with proper parameter placeholders (`$1`, `?`, `:id`) is completely safe against SQL injection; do not flag unless string concatenation/interpolation of untrusted input is present.
- **Do Not Claim Vulnerability without Evidence:** If you suspect a flaw but cannot confirm exploitability due to missing upstream context, classify it as **Potential Risk** or **Hardening Recommendation**, NOT Critical Vulnerability.

---

## 10. Anti-Overengineering Guardrails (Ponytail Principles)

1. **Defense-in-Depth without Security Theater:** Prioritize fundamental controls (Parameterized queries, explicit authorization checks, strong password hashing) over complex multi-tier token encryption or obscure obfuscation.
2. **Use Proven Standard Cryptographic Libraries:** Never invent custom encryption algorithms. Use battle-tested standard libraries (Argon2id, AES-256-GCM, HMAC-SHA256).
3. **Proportional Hardening:** Apply strict controls where sensitive data/money is handled; avoid burdening trivial internal utilities with enterprise compliance overhead.

---

## 11. Finding Classification Schema

| Severity | Definition | Example |
|---|---|---|
| **CRITICAL** | Direct, unauthenticated remote code execution, SQL injection, authentication bypass, or complete tenant data exposure | Raw SQL string interpolation on login endpoint; Missing auth check on financial payout endpoint |
| **HIGH** | Broken object authorization (IDOR) on sensitive records, privilege escalation from user to admin, stored XSS | Authenticated customer able to modify any other customer's order by changing ID in URL |
| **MEDIUM** | Missing rate limiting on authentication routes, weak password policy, reflected XSS with user interaction | Login endpoint allows unlimited password brute-force attempts; Missing CSRF token on state-changing cookie POST |
| **LOW** | Missing defense-in-depth security header, verbose server header (`Server: Apache/2.4`), minor cookie attribute omission | Missing `X-Content-Type-Options: nosniff` header |
| **HARDENING / INFO** | Best-practice architectural improvement, cryptographic hygiene | Recommendation to upgrade bcrypt cost factor from 10 to 12 |

**Valid Output Rule:** If a security review finds that trust boundaries are properly guarded, inputs sanitized, and authorization strictly enforced, output: **"Tidak ada celah keamanan signifikan yang ditemukan / No significant security vulnerabilities found."**

---

## 12. Output Format

```markdown
# Security Review Report: [Target Module / Application]

## 1. Executive Summary & Discovered Architecture
- **Threat Model Scope:** [e.g. Public API & Authentication Boundary]
- **Active Auth / Crypto Stack:** [e.g. Argon2id, JWT with RS256, PostgreSQL ORM]
- **Risk Posture:** [Low / Moderate / High]

## 2. Findings Summary
- **Critical:** [N] | **High:** [N] | **Medium:** [N] | **Low:** [N] | **Hardening:** [N]

## 3. Detailed Security Findings

### [SEC-01] [Broken Object-Level Authorization (IDOR) in Order Mutation]
- **Severity:** HIGH
- **Confidence:** CONFIRMED
- **Vulnerability Class:** CWE-639 / OWASP A01: Broken Access Control
- **Location:** [order.controller.ts:L55-L70](file:///path/to/order.controller.ts#L55-L70)
- **Vulnerable Code Snippet:**
  ```typescript
  // Evidence snippet
  ```
- **Exploit Scenario:**
  1. Attacker logs in as User A.
  2. Sends `DELETE /api/orders/order-999` (belonging to User B).
  3. Controller performs `DELETE FROM orders WHERE id = :id` without checking `user_id == req.user.id`.
- **Impact:** Any authenticated user can delete arbitrary orders across the platform.
- **Remediation Blueprint:**
  ```typescript
  // Recommended fix snippet (shortest working diff)
  ```

## 4. Defense-in-Depth & Hardening Recommendations
- [Proportional best practice recommendations]
```

---

## 13. Verification & Self-Review

Before concluding any security task, verify:
- [ ] Every finding has an exact file and line citation.
- [ ] Every finding describes a concrete, realistic exploit scenario.
- [ ] Severity ratings are grounded in real impact, not inflated for drama.
- [ ] No framework or library was assumed without code evidence.
- [ ] Remediations are minimal, robust, and preserve existing system functionality.
