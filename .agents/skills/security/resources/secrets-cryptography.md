# Secrets & Cryptography Management

Threat model: credential leakage via source control/logs/client bundles,
weak/reused keys, unencrypted sensitive data at rest, key compromise
without rotation path.

---

## 1. Where secrets live (and where they never should)

- `.env` is gitignored; `.env.example` (with placeholder values, no
  real secrets) is committed so the team knows what's required.
- Production secrets belong in a secret manager (AWS Secrets Manager,
  GCP Secret Manager, Doppler, Vault) or the platform's encrypted env
  var store (Railway/Render/Fly/Vercel project secrets) — not in a
  `.env` file sitting on a server, not in CI/CD YAML in plaintext, and
  never in application logs.
- **Never** ship a secret into the frontend bundle. Anything in a
  Vite `VITE_*` env var is **public** — it's inlined into the built JS
  and readable by anyone. Only ever put genuinely public config there
  (API base URL, public keys like a Stripe *publishable* key) — never
  API secret keys, DB credentials, or JWT signing secrets.
- Rotate any secret that was ever accidentally committed to git —
  removing it from a later commit does not remove it from history;
  treat it as burned and issue a new one.

## 2. Key strength & generation

- JWT signing secret (HS256): ≥ 256 bits of real entropy —
  `crypto.randomBytes(32).toString('hex')`, not a memorable phrase.
- Prefer RS256/ES256 (asymmetric) for JWTs when multiple
  services/microservices need to verify tokens without holding the
  ability to mint them.
- API keys/tokens issued to third parties: random ≥ 32 bytes, prefixed
  for identifiability (`sk_live_...`) so leaked-key scanners
  (GitHub secret scanning, GitGuardian) can catch them if committed by
  mistake.

## 3. Encryption at rest

- Database-level: rely on the managed PostgreSQL provider's
  encryption-at-rest (RDS, Neon, Supabase all provide this by default)
  — confirm it's actually enabled, don't assume.
- Field-level encryption for especially sensitive data (national ID
  numbers, bank account numbers) beyond what DB-at-rest encryption
  covers: encrypt with AES-256-GCM using a key from the secret
  manager, store ciphertext + IV, never a reversible custom scheme.
  Hash (don't encrypt) fields you only ever need to compare, never
  redisplay in full.
- Backups inherit the same sensitivity as the live DB — encrypted
  storage, access-controlled, and included in the retention/deletion
  policy (see §5).

## 4. Encryption in transit

- TLS everywhere: database connections (`sslmode=require` on the
  Postgres connection string in production), Redis connections, and of
  course the public-facing API (HSTS once confirmed working — see
  `api-network-security.md`).
- Never allow the app to silently fall back to plaintext if TLS
  negotiation fails for an internal connection (DB/Redis/queue) — fail
  closed, not open.

## 5. Data minimization & retention

- Collect only what the product actually needs; every additional
  sensitive field stored is additional breach liability.
- Define a retention/deletion policy for PII and enforce it (cron job
  or scheduled task) rather than accumulating indefinitely — relevant
  for GDPR/UU PDP (Indonesia's personal data protection law) style
  compliance where "right to erasure" applies.
- Anonymize/pseudonymize data used for analytics where the raw identity
  isn't needed.

## 6. Third-party API keys & webhooks

- Webhook payloads from third parties (payment gateways, etc.) must be
  **signature-verified** (HMAC signature header check) before the
  payload is trusted — never process a webhook body as fact without
  verifying it actually came from the provider using their documented
  signing secret and algorithm.
- Store third-party API keys per-environment (test/live) and make it
  structurally hard to accidentally hit a live payment provider from a
  dev/staging environment (separate env var names, not a single toggle
  flag that's easy to leave in the wrong state).

## 7. Key rotation & incident path

- Have an actual documented procedure for "this secret leaked" — which
  secrets exist, who/what depends on each, and the steps to rotate
  without downtime (dual-key overlap window for JWT secrets so
  in-flight tokens aren't all instantly invalidated, if that matters
  for the product).
- Rotate JWT signing secrets, DB credentials, and third-party API keys
  on a routine cadence in addition to incident-triggered rotation —
  "we've never rotated this" is itself a finding.

## 8. Self-check before calling secrets/crypto "done"

```
[ ] No secret committed to git history (checked, not assumed); .env gitignored, .env.example has placeholders only
[ ] Production secrets in a secret manager / platform-encrypted store, not a plaintext .env on the server
[ ] No secret key (DB, JWT, third-party) ever placed in a VITE_*/frontend-exposed env var
[ ] JWT signing secret ≥256-bit random, or RS256/ES256 used
[ ] DB connections use sslmode=require (or provider equivalent) in production
[ ] Especially sensitive fields (ID numbers, bank accounts) are field-level encrypted or hashed, not plaintext
[ ] Incoming webhooks are signature-verified before being trusted
[ ] A documented key-rotation procedure exists for at least JWT secret + DB credentials
```
