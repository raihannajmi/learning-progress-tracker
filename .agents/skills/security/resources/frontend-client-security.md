# Frontend & Client-Side Security (Vite + React)

Threat model: token theft via XSS, dependency supply-chain compromise,
clickjacking, sensitive data left in client-reachable places, insecure
inter-window messaging.

The frontend is not a trust boundary — assume anything shipped to the
browser can be read, modified, or bypassed by a sufficiently motivated
user. Its job is UX and defense-in-depth, not enforcement (enforcement
lives in `authorization-access-control.md` and `injection-input-
validation.md`, backend-side).

---

## 1. Token storage — the recurring debate, resolved

- **Never** `localStorage`/`sessionStorage` for refresh tokens or any
  long-lived credential — both are fully readable by any JS running on
  the page, so a single XSS anywhere in the app (including a compromised
  third-party script) exfiltrates the token wholesale.
- Preferred pattern: refresh token as an **httpOnly** cookie (JS can't
  read it at all, mitigating XSS token-theft), access token held only
  in memory (a JS variable/React context, not persisted) and silently
  refreshed via the httpOnly cookie on page load / token expiry.
- If a project already stores the access token in memory-only state,
  confirm it's actually memory (component state / a non-persisted
  store) and not accidentally synced into `localStorage` by a
  persistence middleware (common footgun with some state-management
  libraries' default persist config).

## 2. XSS surface specific to React/Vite apps

- Audit every `dangerouslySetInnerHTML` usage — see
  `injection-input-validation.md` §2 for the sanitization requirement.
- Third-party embeds (chat widgets, analytics snippets, ad scripts)
  execute with the same privileges as your own code — each one is a
  supply-chain XSS risk. Load only what's necessary, pin versions, and
  prefer official CDN builds with Subresource Integrity (`integrity=
  "sha384-..."` on the `<script>` tag) over unpinned `latest` URLs.
- Avoid `eval()`, `new Function()`, or `setTimeout(stringArg)` with any
  data that ever touched user input.

## 3. Clickjacking

- Defense is set server-side (`X-Frame-Options`/CSP `frame-ancestors`
  — see `api-network-security.md` §2), but be aware of it when building
  sensitive-action UI (payment confirm, permission grant) — these are
  the pages attackers try to iframe-overlay for "UI redress" attacks.

## 4. Dependency / supply-chain security

- Run `npm audit` (or `pnpm audit`) regularly, and treat high/critical
  findings in production dependencies as blocking, not backlog — see
  `dependency-infra-security.md` for the full workflow.
- Be cautious adding low-download-count or unmaintained packages for
  security-relevant functionality (auth helpers, crypto, sanitizers) —
  prefer the ecosystem-standard, actively maintained option
  (`DOMPurify` over an obscure sanitizer, `jose`/`jsonwebtoken` over a
  hand-rolled JWT implementation).
- Lockfile (`package-lock.json`/`pnpm-lock.yaml`) committed and CI
  installs with `npm ci` (exact lockfile versions), not `npm install`
  (which can silently drift) — prevents dependency-confusion / drift
  between what was audited and what's actually deployed.

## 5. Environment variable exposure (Vite specifics)

- Only variables prefixed `VITE_` are exposed to client code by
  design — this is a feature, but it means **any** secret accidentally
  given that prefix ships to every visitor's browser in plaintext,
  readable via view-source. Double-check `.env` files before adding a
  `VITE_` prefix to anything that isn't genuinely meant to be public.
- Public-safe: API base URL, publishable/public keys (Stripe
  publishable key, public analytics ID), feature flags that aren't
  sensitive.
- Never public: any secret key, internal service URL not meant for
  direct client access, admin credentials.

## 6. Sensitive data in the DOM / browser storage / URLs

- Don't put sensitive identifiers or tokens in the URL query string —
  URLs get logged (server access logs, browser history, `Referer`
  headers to third parties, analytics tools) far more broadly than the
  developer usually expects.
- Autocomplete: mark genuinely sensitive fields (SSN/ID-number-style
  inputs) `autocomplete="off"` where appropriate so browsers don't cache
  them on shared/public machines.
- Clear sensitive in-memory state (access token, form data with PII) on
  logout, not just navigation away — a shared-machine "logout" that
  leaves state in memory/back-forward cache is a real leak vector.

## 7. postMessage / cross-window communication

- If the app uses `window.postMessage` (embedded widgets, OAuth popup
  flows, iframe integrations), always verify `event.origin` against an
  explicit allow-list before trusting the message — an unchecked
  `postMessage` listener accepts messages from **any** origin, which is
  effectively an open door for cross-origin data injection.

## 8. Self-check before calling frontend security "done"

```
[ ] No refresh token / long-lived credential in localStorage or sessionStorage
[ ] Access token held in memory only, not persisted by a state-management library's default config
[ ] Every dangerouslySetInnerHTML usage sanitized (DOMPurify + allow-list)
[ ] Third-party scripts are minimal, version-pinned, SRI-hashed where loaded from a CDN
[ ] npm audit run and high/critical findings triaged, not ignored
[ ] Lockfile committed; CI uses `npm ci`, not `npm install`
[ ] No secret ever carries a VITE_ prefix; .env reviewed before adding one
[ ] Sensitive identifiers/tokens never appear in URL query strings
[ ] Any postMessage listener validates event.origin against an explicit allow-list
```
