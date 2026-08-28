# File Upload & Storage Security

Threat model: malicious file execution, storage exhaustion/cost-DoS,
IDOR on stored files, MIME-sniffing XSS, path traversal via filename,
malware distribution through the platform.

---

## 1. Never trust the client's claims about a file

- File extension and `Content-Type` header from the client are both
  attacker-controlled — a `.jpg` can contain a PHP/JS payload. Verify
  the **actual** file content:
  - Check magic bytes / real MIME type server-side (e.g.
    `file-type` npm package sniffing the buffer), not just
    `multer`'s reported `file.mimetype`.
  - For images specifically, re-encode through an image library
    (`sharp`) rather than storing the raw upload verbatim — this both
    normalizes format and strips embedded scripts/EXIF metadata that
    could carry a payload or leak location data.

## 2. Size & type limits, enforced server-side

```javascript
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB, tuned per file type
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype)); // first line of defense; re-verify with §1 after
  },
});
```

- Different caps per use case (avatar vs document vs video) — a single
  global limit either blocks legitimate large files or allows
  small-file endpoints to be abused for storage exhaustion.
- Reject executable/script-like types outright regardless of stated
  use case (`.exe`, `.sh`, `.php`, `.js` as a direct upload target)
  unless the product genuinely needs arbitrary file hosting, in which
  case treat it as a much higher-risk feature (sandboxed serving domain,
  forced download instead of inline render — see §4).

## 3. Storage keys & filenames

- Never use the client-supplied filename directly as the storage key —
  generate a random/UUID-based key server-side. Reasons: prevents path
  traversal (`../../config.js`), prevents key collisions/overwrites,
  and avoids leaking internal naming patterns.
- Keep the original filename (for user-facing display/download) in the
  database as metadata, separate from the storage key.
- Scope storage keys by tenant/user (`uploads/{tenantId}/{uuid}.ext`)
  so a predictable-key guess can't be used to enumerate other tenants'
  files even before an authorization check runs.

## 4. Serving uploaded files safely

- **Never serve user-uploaded files from the same origin as the app
  with inline rendering** if arbitrary file types are accepted — an
  uploaded HTML/SVG file rendered inline on your domain is a stored-XSS
  vector (SVGs can contain `<script>`). Serve from a separate
  cookie-less subdomain/CDN, or force `Content-Disposition: attachment`
  for non-image types.
- Set the `Content-Type` header on serve based on the **verified**
  MIME type from §1, and pair with `X-Content-Type-Options: nosniff` so
  browsers don't second-guess it into something more dangerous.

## 5. Access control on stored files (IDOR for media)

- A guessable/sequential file URL is not access control. If the file is
  private (KYC documents, contracts, user photos not meant to be
  public), don't rely on "the URL is hard to guess" —
  use **short-lived signed URLs** (S3/R2 presigned GET, expiring in
  minutes) generated only after the backend verifies the requester is
  authorized for that specific resource (same ownership check pattern
  as `authorization-access-control.md`).
- Public-by-design assets (product images, public avatars) can be
  served directly from a CDN without per-request auth, but confirm
  that's genuinely the product's intent and not an oversight.

## 6. Malware scanning (when the risk profile warrants it)

- For products accepting uploads from untrusted/high-volume users
  (public file sharing, resumes, contracts from unknown counterparties),
  consider a malware/AV scan step (ClamAV, or a cloud scanning API)
  before the file is available for other users to download — relevant
  even for "just documents," since a PDF/DOCX can carry a payload for
  the *downloader's* machine even if your server never executes it.

## 7. Self-check before calling upload/storage "done"

```
[ ] Server verifies actual file content (magic bytes/re-encode), not just client-reported mimetype
[ ] Per-use-case size limits enforced server-side (multer limits, not just frontend checks)
[ ] Storage key is server-generated (UUID), never the raw client filename; scoped by tenant/user
[ ] Non-image/arbitrary uploads are served with Content-Disposition:attachment or from a separate origin, not rendered inline
[ ] Private files are served via short-lived signed URLs issued only after an ownership/role check — not by a guessable static URL
[ ] X-Content-Type-Options:nosniff active on the serving path
[ ] High-risk upload surfaces (public/untrusted users) have a malware-scan step considered, not just assumed unnecessary
```
