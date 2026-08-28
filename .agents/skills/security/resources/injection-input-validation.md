# Injection & Input Validation

Threat model: SQL injection, NoSQL/ORM injection, XSS (stored/reflected/
DOM), command injection, path traversal, prototype pollution, ReDoS,
SSRF via user-supplied URLs, mass assignment (see
`authorization-access-control.md` §4).

**Golden rule: validate at the trust boundary (backend), sanitize at the
output boundary (render context). Frontend validation is UX, not
defense.**

---

## 1. SQL injection — Prisma mostly protects you, but not always

- Prisma's query builder (`prisma.model.findMany({ where: ... })`)
  parameterizes automatically — safe by default.
- **Danger zone**: `prisma.$queryRawUnsafe()` and string-concatenated
  `$queryRaw` template pieces. Never interpolate user input into a raw
  SQL string:
  ```javascript
  // ❌ VULNERABLE
  await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

  // ✅ SAFE — tagged template auto-parameterizes
  await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
  ```
- If raw SQL is unavoidable (complex reporting queries), use
  `$queryRaw` tagged templates or explicit parameter binding — never
  string concatenation or `Unsafe` variants with any user-influenced
  value.
- Audit every occurrence of `$queryRawUnsafe`/`$executeRawUnsafe` in the
  codebase as a first pass — each one is a manual review item.

## 2. Cross-Site Scripting (XSS)

- **React escapes by default** — `{userInput}` in JSX is safe. The
  danger is explicit opt-outs:
  - `dangerouslySetInnerHTML` — if unavoidable (rich text preview),
    sanitize server-side on write AND client-side on render with
    `DOMPurify.sanitize(html)`, with an explicit allow-list of tags.
  - Rendering user input into `href`/`src` — reject/strip
    `javascript:`, `data:text/html`, and similar schemes; only allow
    `http(s):`/relative paths.
  - Rendering into `<script>` tags, inline event handlers, or
    `eval()`/`new Function()` with user data — never do this at all.
- **Backend**: strip or encode dangerous HTML on write for any field
  that might later be rendered as rich text; store the raw + sanitized
  version separately if you need to re-render with different rules
  later (don't destructively sanitize the only copy if the original
  matters for audit).
- **Content-Security-Policy** is defense-in-depth here — see
  `api-network-security.md` §2.

## 3. NoSQL / ORM injection & prototype pollution

- If any endpoint accepts a raw filter/query object (e.g. "advanced
  search" features that pass user JSON into `where:`), never spread it
  unvalidated: `prisma.model.findMany({ where: req.body.filter })` lets
  a client inject operators or unintended fields. Build the `where`
  clause explicitly from validated, allow-listed fields.
- Guard against prototype pollution when merging user JSON into objects
  (`Object.assign`, `_.merge`, spread of nested user input) — reject or
  strip `__proto__`, `constructor`, `prototype` keys, or use
  `Object.create(null)` for untrusted maps. Keep `lodash` and similar
  libraries patched (older versions had known prototype-pollution CVEs).

## 4. Command & path injection

- Never pass user input into `child_process.exec()`/`execSync()` with
  string interpolation — use `execFile`/`spawn` with an argument array
  instead, which doesn't invoke a shell.
- File path handling (downloads, template rendering, static file
  serving): resolve the final path and verify it's still inside the
  intended base directory (`path.resolve` + `startsWith` check) before
  reading — otherwise `../../etc/passwd`-style traversal via a
  filename/id parameter is possible.

## 5. ReDoS (regex denial of service)

- Avoid nested-quantifier regexes on user input
  (`(a+)+`, `(.*)+`, catastrophic backtracking patterns). Prefer
  well-tested validation libraries (Zod/Joi's built-in email/URL/UUID
  validators) over hand-rolled regex for anything parsing untrusted
  strings.
- If a custom regex is unavoidable, test it against a pathological
  input (`"a".repeat(50) + "!"`) and confirm it resolves in milliseconds,
  or add an input length cap before the regex ever runs.

## 6. SSRF (server-side request forgery)

- Relevant when the backend fetches a URL supplied by the user (webhook
  registration, "import from URL", link preview/unfurl features,
  avatar-by-URL).
- Never let the server fetch an arbitrary user-supplied URL without
  restriction — an attacker can point it at `http://169.254.169.254/`
  (cloud metadata endpoint), internal service hostnames, or
  `localhost`/private IP ranges to pivot into the internal network.
- Mitigations: resolve the hostname and reject private/loopback/
  link-local IP ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16,
  127.0.0.0/8, 169.254.0.0/16) before connecting; disable HTTP
  redirects or re-validate the destination after each redirect hop;
  allow-list expected domains where feasible; set a strict timeout.

## 7. Input validation contract (Joi/Zod) — the enforcement layer

- **Every** `POST`/`PUT`/`PATCH` route passes through a
  `validateRequest(schema)` middleware before the controller runs — no
  exceptions, including "internal" or "admin-only" routes.
- `stripUnknown: true` (Joi) / explicit `.pick()`/`.strict()` (Zod) so
  unknown/unexpected fields are dropped, not silently accepted (defense
  against mass assignment, see `authorization-access-control.md`).
- Enforce real boundaries, not just types: `min(0)` for money/quantities,
  `integer()` where fractions are invalid, `max()` length caps on every
  free-text field (prevents storage abuse and downstream rendering
  issues), `Joi.date().iso().greater(Joi.ref('startDate'))` for date
  ranges, enum values matching the Prisma schema exactly.
- Validate file uploads through the same discipline — see
  `file-upload-storage-security.md`.
- Keep frontend (Zod + React Hook Form) and backend (Joi/Zod middleware)
  schemas in sync for field names, constraints, and enum values — the
  frontend schema is a UX convenience, the backend schema is the actual
  security boundary and must never be looser.

## 8. Self-check before calling input handling "done"

```
[ ] No `$queryRawUnsafe`/string-concatenated SQL with user input anywhere in the codebase
[ ] No `dangerouslySetInnerHTML` without DOMPurify + tag allow-list
[ ] User-supplied filter/query objects are never spread directly into Prisma `where`
[ ] No `exec()`/`execSync()` with interpolated user input; path params resolved + bounds-checked
[ ] Any user-facing URL fetch (webhooks, link preview) blocks private/loopback/metadata IP ranges
[ ] Every mutating route has `validateRequest(schema)` with stripUnknown + real boundary rules
[ ] Enum values identical across Prisma schema, backend validator, and frontend form
```
