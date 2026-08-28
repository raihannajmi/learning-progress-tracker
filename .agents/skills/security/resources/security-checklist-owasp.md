# OWASP Top 10 & Defensive Security Audit Checklist

> Project-agnostic guidelines for conducting structured defensive security audits mapped to universal vulnerability classifications.

---

## 1. Universal Security Audit Workflow

1. **Map Trust Boundaries & Entry Points:** Enumerate all public endpoints, internal routes, webhooks, file upload handlers, and background message consumers.
2. **Trace Untrusted Data Flows:** Follow user input from network entry point through validation, business logic, to database persistence / system execution.
3. **Assess Privilege & Identity Gates:** Verify authentication, session expiration, and role/permission enforcement on every route.
4. **Classify by Impact & Exploitability:**
   - `CRITICAL`: Exploitable now, catastrophic impact (RCE, unauthenticated data dump, auth bypass).
   - `HIGH`: Exploitable under realistic conditions, high impact (IDOR, privilege escalation, stored XSS).
   - `MEDIUM`: Defense-in-depth gap, brute-force risk, CSRF in non-critical flow.
   - `LOW`: Informational leakage, missing security headers.
   - `HARDENING`: Best practice improvement.

---

## 2. OWASP Top 10 Mapping & Verification Points

| Category | Universal Defensive Check | Finding if Violated |
|---|---|---|
| **A01: Broken Access Control** | Does every query modifying or reading an object verify the requester's ownership or role (`user_id` / `tenant_id`)? | IDOR / BOLA vulnerability allowing cross-user data manipulation. |
| **A02: Cryptographic Failures** | Are passwords hashed with Argon2id, bcrypt, or scrypt? Are sensitive records encrypted with AES-256-GCM? | Plaintext passwords, MD5/SHA1 usage, hardcoded encryption keys. |
| **A03: Injection** | Are database queries parameterized? Are shell commands avoided or strictly sanitized? | SQL / Command / NoSQL injection allowing data extraction or RCE. |
| **A04: Insecure Design** | Are state machine transitions enforced server-side? Are race conditions prevented on financial mutations? | Bypassing payment steps, race condition balance exhaustion. |
| **A05: Security Misconfiguration** | Are default credentials removed? Are stack traces disabled in production? Are CORS and CSP configured? | Verbose debug error pages leaking SQL queries, overly permissive CORS `*`. |
| **A06: Vulnerable Components** | Are dependencies scanned for known CVEs via package audit tools? | High/Critical CVEs in active production dependencies. |
| **A07: Identification & Auth** | Are authentication endpoints protected against brute-force? Are session tokens invalidated on logout? | Unlimited login attempts, session fixation, predictable token entropy. |
| **A08: Software Integrity** | Are external plugins, scripts, and webhooks verified via digital signatures or HMAC? | Unsigned webhook acceptance allowing forged payment notifications. |
| **A09: Logging & Monitoring** | Are security events (logins, privilege escalations, failed auth) logged without recording PII or passwords? | Missing audit logs, or logging plaintext passwords / credit cards in log files. |
| **A10: SSRF** | Are user-supplied URLs fetched server-side validated against internal private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `169.254.169.254`)? | Server fetching internal cloud metadata or local microservice ports. |
