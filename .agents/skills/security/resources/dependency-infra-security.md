# Dependency, Infrastructure & Deployment Security

Threat model: vulnerable transitive dependencies, container escape/
over-privileged runtime, database over-permissioning, CI/CD secret
leakage, unpatched host OS, insecure default configs shipped to
production.

---

## 1. Dependency management

- `npm audit` / `pnpm audit` in CI on every PR — fail the build on
  high/critical severity in production dependencies (dev-only
  dependencies are lower priority but not ignorable).
- Consider `npm audit signatures` / Sigstore-based provenance checks and
  tools like Snyk or Socket.dev for deeper supply-chain visibility
  (typosquatting, install-script abuse) beyond what `npm audit`'s CVE
  database covers.
- Pin exact versions for security-sensitive packages (auth, crypto,
  validation libraries) rather than broad semver ranges, so an upstream
  compromise of a new patch version doesn't auto-install.
- Review `postinstall` scripts of new dependencies before adding them —
  a common supply-chain attack vector is a malicious install script
  that runs with full local privileges the moment `npm install` runs.

## 2. Database security (PostgreSQL)

- **Least privilege DB user**: the app's connection role should have
  only the grants it needs (`SELECT/INSERT/UPDATE/DELETE` on its own
  schema's tables) — never connect the application as the Postgres
  superuser/owner role. Migrations can run under a separate,
  more-privileged role used only at deploy time.
- `sslmode=require` (or stricter) on the connection string in
  production — see `secrets-cryptography.md` §4.
- Network-level: DB should not be publicly reachable from the internet
  at all — bind to a private network/VPC, allow only the app servers'
  security group, and never expose the Postgres port (5432) publicly
  "for convenience" even temporarily.
- Enable and periodically review audit logging on the DB for
  privileged operations (schema changes, role grants) separate from
  application-level audit trails.
- Backups: encrypted, access-controlled, and **tested** — an untested
  backup is not a real recovery plan; periodically verify a restore
  actually works.

## 3. Container / runtime security (Docker)

- Run the app process as a **non-root user** inside the container
  (`USER node` or an explicit UID in the Dockerfile) — a container
  breakout as root is materially worse than as an unprivileged user.
- Use a minimal base image (`node:XX-slim`/`-alpine`) to shrink the
  attack surface (fewer preinstalled tools an attacker could pivot
  with).
- `.dockerignore` must exclude `.env`, `.git`, `node_modules` — an
  accidentally-included `.env` baked into an image layer is a
  persistent leak (visible even after the file is later "removed" in a
  later layer, since Docker layers are immutable history).
- Multi-stage builds so build-time secrets (e.g. a private registry
  token used only to `npm install`) never end up in the final runtime
  image layer.
- Don't run with `--privileged` or unnecessary added Linux capabilities;
  keep the container's capability set minimal.

## 4. CI/CD pipeline security

- Secrets (deploy keys, DB credentials, API keys) live in the CI
  platform's encrypted secrets store, never in the pipeline YAML in
  plaintext, and are scoped to the minimum jobs that need them.
- Pin third-party GitHub Actions/CI plugins to a commit SHA (not a
  mutable tag like `@v1`) for anything with write access to secrets or
  the ability to publish — a compromised upstream action is a real
  supply-chain vector (this has happened to major projects).
- Require review/approval for workflow file changes in the same way as
  code changes — a modified CI file can exfiltrate secrets just as
  easily as a modified app file.
- Branch protection: no direct push to `main`/`production`, require
  passing security checks (audit, lint, tests) before merge.

## 5. Environment separation

- Distinct credentials and API keys per environment (dev/staging/prod)
  — never reuse a production database, JWT secret, or payment-provider
  live key in a lower environment. Make it structurally hard to point a
  dev build at prod (separate env var names/values, not a single
  `IS_PROD` boolean gating a shared credential).
- Staging/dev environments holding realistic data still need real
  security controls — "it's just staging" is a common route to a real
  data leak when staging is seeded from a production snapshot without
  masking PII.

## 6. Host & platform hygiene

- Keep the Node.js runtime version patched (security releases happen
  regularly) — pin a major version but track and apply patch releases
  promptly, don't run an EOL Node version in production.
- If self-managing servers rather than using a managed platform: OS
  patches, minimal exposed ports (only 443/80 + SSH restricted to known
  IPs), and a host-level firewall in addition to any cloud security
  group.

## 7. Self-check before calling infra/deployment security "done"

```
[ ] CI runs npm/pnpm audit on every PR; high/critical in prod deps blocks merge
[ ] App connects to Postgres with a least-privilege role, not superuser/owner
[ ] Database is not publicly reachable; sslmode=require in production
[ ] Container runs as non-root user; minimal base image; .dockerignore excludes .env/.git
[ ] Multi-stage Docker build keeps build-time secrets out of the final image
[ ] CI/CD secrets are in the platform's encrypted store, scoped per job, never in plaintext YAML
[ ] Third-party CI actions pinned to commit SHA, not a mutable tag
[ ] Distinct credentials per environment; staging never silently shares prod secrets/keys
[ ] Backups are encrypted and restore has actually been tested at least once
```
