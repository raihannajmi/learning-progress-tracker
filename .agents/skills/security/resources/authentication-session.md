# Authentication & Session Security

Threat model: credential stuffing, brute force, session hijacking, session
fixation, token replay, account enumeration, privilege escalation via
stale/forged tokens.

---

## 1. Password storage

- **Never** MD5/SHA1/SHA256 alone for passwords. Use **argon2id**
  (preferred) or **bcrypt** (cost factor ≥ 12, re-benchmark yearly as
  hardware gets faster).
  ```javascript
  import argon2 from 'argon2';
  const hash = await argon2.hash(plainPassword, { type: argon2.argon2id });
  const ok = await argon2.verify(hash, plainPassword);
  ```
- Never log, return, or include the password hash in any API response —
  exclude it explicitly in Prisma `select`, don't just rely on frontend
  to not render it.
- Password reset / change must **invalidate all existing sessions and
  refresh tokens** for that user (see §4).

## 2. Password policy — balance security with usability

- Minimum length ≥ 10 (length matters more than forced complexity rules).
- Check against a breached-password list (e.g. `zxcvbn` for strength
  scoring, or HaveIBeenPwned's k-anonymity range API) rather than
  arbitrary "must contain 1 uppercase, 1 symbol" rules that push users
  toward predictable substitutions (`Password1!`).
- Don't silently truncate passwords — bcrypt has a 72-byte limit; reject
  or pre-hash with SHA-256 before bcrypt if you must support longer
  input.

## 3. Login endpoint hardening

- **Rate limit** by IP AND by account identifier (email/username)
  independently — IP-only limiting is bypassed by botnets; account-only
  limiting enables a DoS lockout attack against a specific victim. Use a
  sliding window (Redis) with exponential backoff, not a hard counter
  reset.
- **Account enumeration**: login, register, and forgot-password
  responses must be identical in shape and near-identical in timing
  whether the account exists or not — `"Invalid credentials"`, never
  `"User not found"` vs `"Wrong password"`.
- **Timing-safe comparison** is handled automatically by bcrypt/argon2
  verify — but if you ever compare tokens/secrets manually, use
  `crypto.timingSafeEqual`, never `===`.
- **Lockout policy**: prefer progressive delay + CAPTCHA after N failed
  attempts over permanent lockout (permanent lockout is itself a DoS
  vector against a victim's account).

## 4. JWT — access token + refresh token pattern

- **Access token**: short-lived (5–15 min), stateless, signed with
  `RS256` (asymmetric, so services can verify without holding the
  signing key) or `HS256` with a secret ≥ 256 bits pulled from env/secret
  manager — never hardcoded, never committed.
- **Refresh token**: longer-lived (days), **stored server-side**
  (DB/Redis) so it can be revoked, and sent to the client only as an
  **httpOnly, Secure, SameSite=Strict (or Lax)** cookie — never in
  `localStorage`/`sessionStorage` (XSS-readable) and never as a
  long-lived access token reused for API calls.
- **Rotation**: every refresh-token use issues a new refresh token and
  invalidates the old one (rotation). Detect reuse of an already-rotated
  token → treat as compromise, revoke the entire token family, force
  re-login.
- **Revocation**: maintain a denylist/allowlist (Redis, TTL = token
  remaining lifetime) so a logout, password change, or admin-forced
  logout actually takes effect before the access token's natural expiry.
- **Claims discipline**: put `sub` (user id), `role`, `iat`, `exp`, and a
  `jti` (for revocation) — never put PII, permissions arrays that go
  stale, or anything sensitive in the payload (JWT payload is
  base64, **not encrypted**, anyone can decode it).
- Verify `alg` explicitly server-side (`jwt.verify(token, secret, {
  algorithms: ['HS256'] })`) — never accept `alg: none` or let the
  client dictate the algorithm (classic **JWT algorithm-confusion**
  attack).

## 5. Session fixation & concurrent sessions

- Regenerate the session ID / issue a fresh token pair on every
  successful login — never reuse a pre-auth session identifier
  post-auth.
- If the product needs "log out other devices", track refresh tokens
  per device/session (table: `userId, tokenHash, deviceInfo, createdAt,
  lastUsedAt`) so individual sessions can be revoked without nuking all.

## 6. Multi-factor authentication (when the product needs it)

- TOTP (RFC 6238) via `otplib`/`speakeasy` is the pragmatic default —
  store the shared secret encrypted at rest, never plaintext.
- Rate-limit OTP verification attempts (6-digit code = 1,000,000
  combinations, brute-forceable without a limiter).
- Provide backup/recovery codes, single-use, hashed at rest like
  passwords.

## 7. Email/phone verification & account recovery

- Verification and password-reset tokens: random ≥ 32 bytes
  (`crypto.randomBytes(32).toString('hex')`), single-use, short TTL
  (15–60 min), stored **hashed** in DB (so a DB leak doesn't hand out
  live reset tokens) — compare the hash of the incoming token, not the
  raw token.
- Invalidate a reset token the moment it's used or a new one is
  requested — never leave multiple valid tokens for the same purpose.

## 8. Self-check before calling auth "done"

```
[ ] Passwords hashed with argon2id/bcrypt(cost>=12); hash never returned in any response
[ ] Login/register/forgot-password give identical response shape regardless of account existence
[ ] Login rate-limited by IP AND by account identifier, with backoff
[ ] Access token short-lived; refresh token httpOnly+Secure+SameSite cookie, server-revocable
[ ] Refresh token rotation implemented; reuse of a rotated token revokes the whole family
[ ] JWT verify pins the algorithm explicitly; no sensitive data in JWT payload
[ ] Session/token issued fresh on login (no fixation); logout actually revokes server-side
[ ] Password reset/verification tokens: random, hashed at rest, single-use, short TTL
[ ] Password change/reset invalidates all other active sessions
```
