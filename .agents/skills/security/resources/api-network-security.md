# API & Network Security (CORS, Headers, Rate Limiting & TLS)

> Project-agnostic guidelines for network boundaries, HTTP security headers, CORS policies, and rate-limiting architectures.

---

## 1. Cross-Origin Resource Sharing (CORS)

- **Do Not Use Wildcard `Access-Control-Allow-Origin: *` with Credentials:** If authentication uses cookies or Authorization headers, wildcards are forbidden by browsers and dangerous.
- **Whitelist Explicit Domains:** Restrict allowed origins to specific known frontend domains loaded from environment configuration:
  ```text
  ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com
  ```
- **Disallow Null Origin:** Never reflect `Origin: null` in CORS headers.

---

## 2. Essential HTTP Security Headers

Every production web server or API gateway must return these baseline defensive headers:

| Header | Recommended Value | Purpose |
|---|---|---|
| **Content-Security-Policy (CSP)** | `default-src 'self'; script-src 'self' ...; frame-ancestors 'none';` | Prevents XSS execution and iframe clickjacking. |
| **X-Content-Type-Options** | `nosniff` | Prevents browsers from MIME-sniffing away from declared content type. |
| **X-Frame-Options** | `DENY` or `SAMEORIGIN` | Legacy clickjacking defense. |
| **Strict-Transport-Security (HSTS)** | `max-age=31536000; includeSubDomains` | Forces HTTPS for all future requests (enable only once TLS is verified). |
| **Referrer-Policy** | `strict-origin-when-cross-origin` | Protects sensitive URL query parameters from leaking to external referrers. |
| **Server / X-Powered-By** | *Remove / Mask* | Prevents trivial fingerprinting of underlying framework version. |

---

## 3. Rate Limiting & DoS Protection

- **Authentication Endpoints:** Login, password reset, register, and MFA validation MUST have aggressive rate limiting (e.g. 5-10 attempts per minute per IP/account).
- **Public Mutation Endpoints:** Checkout, contact forms, file uploads, SMS dispatch must be throttled to prevent spam and financial exhaustion.
- **Rate Limit Storage:** Use in-memory token buckets for single-instance apps, or shared Redis token buckets for multi-instance distributed apps.
