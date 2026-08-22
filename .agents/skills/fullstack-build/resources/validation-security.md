# Validation & Security Reference (Joi/Zod, Helmet, CORS, Rate Limiting, JWT, IDOR)

> Loaded whenever you're wiring input validation or hardening security — do this on every feature that touches user input or auth, not just when explicitly asked.

# End-to-End Schema Validation & Contract Audit (Joi + Zod)

Specialized guide for auditing, synchronizing, and enforcing bulletproof validation schemas across React frontend forms and Express.js backend endpoints.

---

## 1. Core Principles

### A. Two-Tier Validation Guard (Defense in Depth)
- **Frontend (Zod + React Hook Form):** Provides immediate UX feedback, prevents invalid HTTP requests, and formats user input before dispatch.
- **Backend (Joi / Zod Middleware):** The **Trust Boundary**. Validates, type-checks, and strips untrusted fields before controller logic executes.
- **Rule:** Never rely solely on frontend validation. Every `POST`, `PUT`, and `PATCH` endpoint MUST pass through a request validator middleware (e.g. `validateRequest(schema)`).

---

## 2. Validation Dimensions & Audit Checklist

### A. Mass-Assignment & Payload Sanitization
- **Rule:** Backend Joi schemas must strip or reject unknown fields to prevent mass-assignment attacks (e.g. users attempting to inject `roleId`, `isVerified`, `status`, or `price` directly).
- Use `stripUnknown: true` or strict Joi schemas:
  ```javascript
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  req.body = value; // Replace req.body with sanitized, stripped object
  ```

### B. Numeric Coercion & Boundary Validation
- **Currency & Quantities:**
  - Must validate `min(0)` for prices, deposits, penalties.
  - Must validate `min(1)` for counts (e.g. `participantCount`, `capacity`, `stock`).
  - Must validate integer types where fractions are invalid (e.g. `Joi.number().integer().min(1)`).
- **Percentages:** Must validate `min(0).max(100)` (e.g. `tax_percent`, `percentage`).

### C. Date & Interval Validation
- **Rule:** When accepting start and end dates/times, backend validation must assert that `endDatetime > startDatetime`:
  ```javascript
  startDatetime: Joi.date().iso().required(),
  endDatetime: Joi.date().iso().greater(Joi.ref('startDatetime')).required()
  ```
- Prevent booking past dates: `startDatetime: Joi.date().iso().min('now')`.

### D. Enums & Status Synchronization
- All enum fields (`availabilityStatus`, `docType`, `itemType`, `terminationType`, `spLevel`, `billingCycle`) MUST have identical string literal values in:
  1. `schema.prisma`
  2. Backend Joi/Zod validator
  3. Frontend form select/radio components

---

## 3. Step-by-Step Audit Workflow

```
1. Map every route in backend-service/src/modules/**/*.routes.js.
2. Verify that every mutating route (POST, PUT, PATCH) uses `validateRequest(...)`.
3. Check backend-service/src/shared/validators/ for schema completeness:
   - Check required vs optional fields.
   - Check min/max string lengths and numeric boundaries.
   - Check enum alignments with Prisma schema.
4. Compare with frontend form schemas in frontend-service/src/pages/**:
   - Verify matching field names and error messages.
   - Verify zodResolver integration in useForm.
```

---

# Web & API Security Hardening Audit

Comprehensive audit and implementation guide for full-stack security hardening across Node.js/Express.js APIs and React single-page applications.

---

## 1. Core Security Dimensions

### A. Cross-Site Scripting (XSS) Defense
- **Backend:** Sanitize incoming text strings to strip dangerous HTML tags and `<script>` injections before storing in the database.
- **Frontend:**
  - Avoid `dangerouslySetInnerHTML`. If HTML rendering is mandatory (e.g. rich text description or preview), ALWAYS sanitize using `DOMPurify.sanitize(html)`.
  - Avoid rendering user input directly into executable contexts (e.g. `javascript:`, `eval()`, or unescaped template literals in `href`).

### B. HTTP Security Headers (Helmet & CSP)
- Use `helmet()` middleware in Express.js:
  ```javascript
  const helmet = require('helmet');
  app.use(helmet({
    contentSecurityPolicy: false, // configure specifically if embedding external media
    crossOriginEmbedderPolicy: false
  }));
  ```
- Ensure `X-Content-Type-Options: nosniff` and `X-Frame-Options: SAMEORIGIN` (or `DENY`) are active to prevent MIME sniffing and clickjacking.

### C. CORS & Origin Lockdown
- **Anti-Pattern:** Using `cors({ origin: '*' })` or allowing wildcard origins with `credentials: true`.
- **Rule:** Whitelist exact domain origins (e.g. `http://localhost:5173`, production domains) and reject unauthorized origins:
  ```javascript
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy'));
      }
    },
    credentials: true
  }));
  ```

### D. Rate Limiting & Brute-Force Mitigation
- **Rule:** Sensitive endpoints MUST be protected with rate limiting:
  1. `/api/v1/auth/login` and `/api/v1/auth/register` (max 5-10 attempts per minute per IP).
  2. Upload routes (`/media`, `/documents`, `/kyc/me`) to prevent storage exhaustion and DoS attacks.
  3. Sensitive financial action routes (`/payments`, `/verify`).
- Use `express-rate-limit` backed by Redis store in production.

### E. Authorization & Insecure Direct Object References (IDOR)
- Every route handling private entities (e.g. `GET /rentals/:id`, `POST /rentals/:id/documents`, `GET /users/kyc/me`) MUST verify tenant ownership:
  - If role is `PENYEWA`: verify `entity.tenantUserId === req.user.id`.
  - If role is `ADMIN_ASET` or `PIMPINAN`: allow authorized role access.
- Never rely on the client passing `userId` in the body payload; ALWAYS extract `req.user.id` from the verified JWT token.

### F. File Upload Safety (Magic Bytes & MIME Protection)
- Never trust file extensions alone (`.jpg`, `.pdf`).
- Verify `file.mimetype` in multer filter.
- Enforce strict size limits (e.g. max 5MB for images, 10MB for PDFs).
- Generate random, collision-safe file keys on the server rather than using original raw user file names directly in S3/R2 keys.

---

## 2. Security Audit Checklist

```
[ ] 1. Auth & JWT: verifyToken middleware enforces active user status (is_active: true).
[ ] 2. RBAC: checkRole middleware enforces least privilege per endpoint.
[ ] 3. Rate Limiting: Login, register, and file uploads are protected against brute-force / DoS.
[ ] 4. CORS: Origins are strictly whitelisted; wildcards with credentials disabled.
[ ] 5. Headers: Helmet is enabled with anti-sniffing and anti-clickjacking.
[ ] 6. IDOR: Mutating operations check req.user.id against resource ownership.
[ ] 7. XSS: No unsanitized dangerouslySetInnerHTML in React frontend.
[ ] 8. Mass-Assignment: Joi schemas strip untrusted / unvalidated body properties.
```
