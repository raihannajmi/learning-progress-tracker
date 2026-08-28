# Logging, Monitoring & Incident Response

Threat model: undetected breach (no visibility), tampered/deleted audit
trail, PII leakage through logs themselves, slow/absent incident
response.

---

## 1. What to log

- **Security-relevant events, always**: login success/failure, password
  change/reset, role/permission changes, admin actions on other users'
  data, authorization failures (403s on sensitive routes — repeated
  403s from one account/IP is a probing signal), rate-limit triggers.
- **Business-critical mutations**: who changed what, when, and the
  before/after state for anything financial or high-stakes (approvals,
  refunds, status transitions) — this is the audit trail, and it needs
  to answer "who did this and can we prove it" after the fact.
- Structured logging (JSON, not free-text) with consistent fields
  (`timestamp, level, userId, requestId, action, resourceId, ip,
  outcome`) so logs are queryable, not just readable.

## 2. What NOT to log

- Never log full request bodies for auth endpoints (passwords, tokens,
  OTP codes) or full card/payment details — redact before logging, not
  after. A common real-world leak vector is "we log every request for
  debugging" catching the login password in plaintext in a log
  aggregator that has broader access than the production DB does.
- Redact/mask PII in logs where the raw value isn't needed for the log's
  purpose (e.g. log `user_***@domain.com` or a user ID instead of a full
  email where possible for high-volume logs).
- Don't log the JWT itself (even though it's not literally the
  password, a logged valid token is a replayable credential until it
  expires).

## 3. Log integrity & retention

- Ship logs to a centralized, access-controlled system (not just local
  files on the app server) — local-only logs are lost/tamperable if the
  server is compromised, which is exactly when you need them intact.
- Application-level audit trail for critical actions (see §1) should be
  **append-only** at the data layer — no `UPDATE`/`DELETE` grants on
  the audit table for the application's normal runtime role; if a
  correction is needed, insert a compensating record, don't mutate
  history.
- Define a retention period that satisfies both operational need and
  any regulatory requirement (and doesn't indefinitely accumulate PII
  beyond what's justified — see `secrets-cryptography.md` §5).

## 4. Monitoring & alerting

- Alert on concrete signals, not just raw log volume: spike in 401/403
  responses, spike in failed logins for a single account or from a
  single IP, unusual admin-action volume, error-rate spike after a
  deploy, rate-limit triggers clustering on one endpoint.
- Dependency vulnerability alerts (Dependabot/Snyk) routed somewhere a
  human actually sees them, not just accumulating unread.
- Uptime/error monitoring (Sentry or equivalent) configured to scrub
  PII/secrets from captured exception context before it's stored by the
  third-party service — the same redaction discipline as §2 applies to
  error-tracking payloads, which are easy to forget about.

## 5. Incident response — have the runbook before you need it

Minimum viable incident runbook, written down before an incident, not
during one:

1. **Detect** — how the team actually finds out (alert channel, who's
   on-call).
2. **Contain** — fastest safe action to stop ongoing damage: revoke the
   specific leaked credential/token, rate-limit or block the offending
   IP/account, disable the affected endpoint/feature flag if needed —
   prefer the narrowest containment that stops the bleeding over a full
   shutdown, unless severity demands it.
3. **Assess scope** — which users/records were actually affected, using
   the audit trail from §1 (this is why the audit trail needs to be
   trustworthy and queryable).
4. **Eradicate & recover** — patch the actual vulnerability, rotate
   every credential that could plausibly have been exposed (see
   `secrets-cryptography.md` §7), verify the fix before declaring
   resolved.
5. **Notify** — determine legal/contractual disclosure obligations
   (affected users, regulators under UU PDP/GDPR-equivalent
   requirements if PII was exposed) — this is a policy/legal
   decision, not a purely technical one, but the technical team should
   know the obligation exists and flag it rather than assuming it's
   someone else's problem.
6. **Post-mortem** — blameless review of what happened and what
   concretely changes (a control, a test, a monitor) so the same class
   of incident is harder next time.

## 6. Self-check before calling logging/monitoring "done"

```
[ ] Security-relevant events (auth, permission changes, admin actions, 403s) are logged
[ ] Financial/critical mutations have a queryable before/after audit trail
[ ] Passwords, tokens, OTPs, full payment details are never present in logs, even redacted late
[ ] Logs are structured (JSON) with consistent fields, shipped to a centralized system
[ ] Application audit table has no UPDATE/DELETE grant for the normal app runtime role
[ ] Alerting exists for failed-login spikes, 403 spikes, and post-deploy error-rate spikes
[ ] Error-tracking tool (Sentry etc.) is configured to scrub PII/secrets before storage
[ ] A written incident-response runbook exists and the team knows where it is
```
