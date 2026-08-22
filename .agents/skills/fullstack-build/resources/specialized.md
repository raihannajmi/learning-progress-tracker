# Specialized Concerns Reference (background jobs, file storage, PDF generation)

> Loaded for background workers/cron/PDF rendering pipelines, and file-upload/storage flows (S3/R2).

# Background Worker & Job Queue Audit

Audits the architecture, performance, error isolation, and resource
management of background workers, asynchronous queues, and automated
document generation.

---

## 0. Discovery

Before auditing, identify:

1. **Queue library in use** — BullMQ, Bee-Queue, pg-boss, node-cron, etc.
   Check `package.json` and the queue/worker setup files.
2. **Worker entry points** — where are Workers/Processors defined? One
   file per queue, or centralized?
3. **Headless browser usage** — is Puppeteer/Playwright used? Where is
   the browser instance created (per-job or shared singleton)?
4. **Redis connection config** — same connection used for app cache and
   BullMQ? Separate connections?
5. **Cron/scheduled jobs** — where are they registered? Any overlap with
   queue-based jobs?

---

## 1. Core Audit Dimensions

### A. Browser/Page Instance Lifecycle (Headless Rendering)

**Anti-pattern:** Launching a new browser process on every job adds
significant latency and leaks resources under concurrency.

**Standard:** Use a warm singleton browser instance. Only create new
isolated page contexts per job, not a new browser:

```javascript
let sharedBrowser = null;

const getSharedBrowser = async () => {
  if (sharedBrowser && sharedBrowser.isConnected()) return sharedBrowser;
  sharedBrowser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox',
           '--disable-dev-shm-usage', '--disable-gpu']
  });
  return sharedBrowser;
};
```

Audit checklist:
- [ ] Is there a singleton browser instance, or is a new browser launched
      per job?
- [ ] Is `page.close()` called in a `finally` block to prevent zombie
      tabs even when the job throws?
- [ ] Is a timeout set on page operations (`page.setContent`,
      `page.pdf`, `page.goto`) to prevent hung jobs?
- [ ] What happens if the shared browser crashes — is there a reconnect
      strategy?

### B. Job Timeouts & Zombie Prevention

Every async job MUST have explicit timeouts and cleanup guards:

- Page-level operations: set `{ timeout: N }` on `setContent`, `pdf`,
  `goto`, `waitForSelector`.
- Job-level: BullMQ supports `{ timeout: N }` per job option; use it.
- `finally` block: always close the page regardless of success/failure.
- Verify: what is the current timeout value? Is it calibrated to actual
  observed rendering time, or was it picked arbitrarily?

### C. Progress Reporting

- Does the job emit progress steps so the caller can show meaningful UI
  feedback (not just a spinner that could be a hung job)?
- Are progress percentages tied to real work milestones (data fetched,
  render complete, upload complete, DB updated) — or arbitrary?
- Is there a WebSocket or SSE channel that actually delivers progress
  to the frontend, or is progress only logged server-side?

### D. Concurrency & Connection Safety

- [ ] Is the BullMQ Worker concurrency setting configured, or is it the
      default (which may be 1 or unlimited depending on version)?
- [ ] Are Redis connections for the queue (`Queue`, `Worker`,
      `QueueEvents`) separate from the app's main Redis connection, or
      shared? Shared connections can cause interference under load.
- [ ] Does the worker handle `disconnected` and `error` events on its
      Redis connection, or will it silently fail?
- [ ] Can the same job be processed twice (e.g. Redis reconnect after
      a network hiccup)? Is there idempotency protection?

### E. Failure & Retry Logic

- [ ] What is the retry policy (attempts, backoff strategy)?
- [ ] On final failure (exhausted retries), is the job moved to a dead
      letter queue, or is it silently dropped?
- [ ] Are failed jobs logged with enough context (job ID, input, error
      stack) to debug without re-running?
- [ ] For jobs with side effects (file upload, external API call), are
      retries safe (idempotent)? A retry that re-uploads a file and
      creates a duplicate DB record is worse than a failed job.

### F. Cron Job Correctness

- [ ] Is the cron schedule correct for the intended business timing
      (timezone-aware)?
- [ ] If the server restarts between cron runs, does the job still fire
      on schedule, or does it miss the next window?
- [ ] Can the cron fire while a previous run is still executing? Is
      there a lock/mutex to prevent overlap?
- [ ] Is the cron entry registered at app startup only once, or
      potentially multiple times (e.g. if the setup function is called
      more than once)?

---

## 2. Severity Classification

- **P0 — Blocking**: Job failure causes data loss, corrupted state, or
  resource exhaustion (browser leak, connection pool exhaustion).
- **P1 — Important**: Jobs succeed but are fragile (no timeout, no retry,
  no cleanup guard), or idempotency not guaranteed.
- **P2 — Improvement**: Progress reporting missing, suboptimal
  concurrency config, cron overlap possible but unlikely.

---

## 3. Output Format

Write findings to `background-worker-audit-<date>.md`:

```md
# Background Worker Audit

## Discovery Summary
- Queue library: <name + version>
- Workers found: <list of worker files>
- Browser strategy: <per-job launch / singleton / none>
- Redis connections: <shared / separate>

## Findings

[P0] <Worker/Queue name>: <description>
File: <path:line>
Problem: <what's wrong>
Risk: <what can go wrong>
Fix: <smallest correct change>

## Checklist
- [ ] Singleton browser with per-job pages
- [ ] Page cleanup in finally blocks
- [ ] Explicit timeouts on all page operations
- [ ] Job-level timeout configured
- [ ] Retry policy defined with idempotency guarantee
- [ ] Dead letter queue for exhausted retries
- [ ] Separate Redis connections for queue vs app cache
- [ ] Cron overlap protection
```

"stop background-worker-audit" or "normal mode": revert to normal behavior.

---

# Storage & Media Flow Audit (Cloudflare R2 / S3)

Specialized guide for auditing, securing, and standardizing binary file and image uploads to Cloudflare R2 and S3 object storage in full-stack Express.js + React applications.

## 1. Core Verification Dimensions

### A. Public vs Private URL Resolution (R2 / S3 Anti-Pattern)
- **Problem:** `multer-s3` exposes `req.file.location`, which points to the private S3 endpoint URL. Direct browser requests to this URL result in **HTTP 403 Access Denied**.
- **Rule:** NEVER store `req.file.location` directly for R2/private S3 assets. ALWAYS resolve public URLs through a `getPublicUrl(key)` helper using your project's public CDN domain env variable.
- **Double Slash Prevention:** Ensure `getPublicUrl` strips trailing slashes from the base URL and leading slashes from the file key:
  ```javascript
  const getPublicUrl = (key) => {
    if (!key) return null;
    if (key.startsWith('http://') || key.startsWith('https://')) return key;
    const baseUrl = (process.env.PUBLIC_STORAGE_URL || '').replace(/\/+$/, '');
    const cleanKey = key.replace(/^\/+/, '');
    return `${baseUrl}/${cleanKey}`;
  };
  ```

### B. Cache Invalidation on Media Mutations
- **Problem:** Entity records are cached. When a file is uploaded or deleted, the database is updated but the cache still serves old data with a stale or missing media URL.
- **Rule:** Every upload and delete controller MUST trigger explicit cache invalidation for the affected entity's cache keys:
  ```javascript
  await db.entityMedia.create({ data: { entityId, fileUrl } });
  await cacheService.invalidateEntityCache(entityId); // Mandatory!
  ```

### C. Multipart/Form-Data Staging in React
- **Problem:** React forms using state JSON forget to wrap binary files in `FormData`, sending `[object File]` or omitting files during bulk submission.
- **Rule:** Multi-file and single-file uploads must use `new FormData()`, append `file`, `mediaType`, and call with `{ headers: { 'Content-Type': 'multipart/form-data' } }`.

### D. File MIME & Size Safety
- **Images:** Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`. Max size: 5MB (adjust to project requirements).
- **Documents:** Allowed MIME types: `application/pdf`, `image/jpeg`, `image/png`. Max size: 10MB (adjust to project requirements).
- **IDOR Protection:** Upload routes MUST verify ownership/authorization before associating files with a parent entity (e.g. verify the requesting user owns the record before attaching a file to it).

---

# PDF Document Builder

Standardizes the architecture and output quality of server-side PDF
generation pipelines and the templates they render.

---

## 0. Discovery

Before building or auditing:

1. **Renderer in use** — Puppeteer (HTML → PDF via headless Chromium),
   PDFKit (programmatic), or a different library?
2. **Template format** — HTML/CSS templates? Handlebars/EJS? JSX?
3. **Where rendering happens** — request-time (blocking), background job
   (async), or cached/pre-generated?
4. **Storage target** — local file, object storage (S3/R2), or returned
   as a stream?
5. **Frontend viewer** — `<iframe src>`, `react-pdf`, download link only?

---

## 1. Rendering Pipeline Principles

### A. Puppeteer: Prefer Async / Background Jobs

PDF generation via Puppeteer is CPU-intensive and slow (500ms–3s per
document). Do not render synchronously in an HTTP request handler for
anything that might queue up under load.

Preferred pattern:
1. Enqueue a job (BullMQ, pg-boss, etc.) when a PDF is requested.
2. Worker picks up the job, renders, uploads to storage.
3. Client polls or receives a WebSocket/SSE notification when ready.

For low-volume or admin-only generation, synchronous is acceptable —
document this explicitly in the code.

### B. Shared Browser Instance (see `background-worker-audit`)

- Use a warm singleton browser, not a new `puppeteer.launch()` per job.
- Every page must be closed in a `finally` block.
- Set explicit timeouts on `setContent`, `pdf`, `goto`.

### C. PDFKit: Stateful Builder Pattern

- Document structure must be built top-to-bottom; PDFKit does not reflow.
- Calculate column widths explicitly — PDFKit has no flexbox or grid.
- Use `doc.save()` / `doc.restore()` around styled regions to avoid
  style leakage.

---

## 2. Template Design Principles

### A. Structure

Every formal document should have:

1. **Header** — organization name/logo, document type, document number,
   and date. Document number must follow the project's entity code
   convention (see `entity-unique-code-generator`).
2. **Parties** — clearly labeled parties (if applicable): issuer and
   recipient, with their identifying information.
3. **Body** — the substantive content: clauses, line items, data tables,
   or narrative text.
4. **Footer** — page number, generation timestamp, and any disclaimer or
   watermark for drafts.
5. **Signature area** — if applicable, a reserved signature block for
   each signatory. Include a fallback ("Pending signature") when the
   signature is not yet collected.

### B. Typography for Print

- Use a serif or neutral sans-serif font at 10–12pt for body text —
  screen-optimized fonts (Inter, Plus Jakarta Sans) may render fine in
  Puppeteer but verify in actual PDF output.
- Line-height: 1.4–1.6 for body text; tighter (1.0–1.2) for table rows.
- Avoid very thin font weights — weight 300 often renders poorly in PDF.
- Tables: use explicit `border-collapse: collapse` and `border: 1px solid
  #ccc` — Chromium's default table borders in print mode are unreliable.

### C. Number & Date Formatting

- **Currency**: format with explicit locale. Never rely on the browser's
  default locale — Puppeteer's Chromium headless may not have it set.
  Example: `new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)`.
  Adapt locale and currency to the project's target region.
- **Dates**: format in the locale and calendar system appropriate for
  the document's legal jurisdiction. Always use `Intl.DateTimeFormat`
  with explicit locale, not `toLocaleDateString()` without locale.
- **Large numbers in text** (terbilang / amount in words): if required
  by the document's legal jurisdiction, compute server-side with a
  dedicated library — never compute client-side and trust the result.

### D. Multi-Page Safety

- Ensure content does not overflow a page in unexpected ways. Use
  `page-break-inside: avoid` on table rows and signature blocks in CSS.
- Test with data sets large enough to force a page break — PDF overflow
  bugs only appear on the second page.

---

## 3. Storage & URL

- Generated PDFs MUST be stored in persistent object storage (S3, R2,
  etc.), not in the local filesystem — local files do not survive
  container restarts or horizontal scaling.
- Store the storage key/path in the database, and derive the public URL
  using the same `getPublicUrl` pattern as the rest of the project's
  file storage.
- For signed/authenticated PDFs: use a pre-signed URL with a TTL
  appropriate to the document's sensitivity.

---

## 4. Frontend Viewer Integration

- Prefer `<a href="..." download>` or `window.open(url)` for most
  documents — simpler, native, works on all devices.
- Embedded iframe/`<embed>` is acceptable for desktop admin screens
  where the user is expected to review before downloading.
- `react-pdf` is appropriate when you need to overlay annotations,
  highlight, or build a custom reading UI — overkill for simple download.
- Always show a loading state while the PDF URL is being fetched/generated.
- If generation is async: show a "Generating..." state with a progress
  indicator; poll or use WebSocket to know when it's ready.

---

## 5. Implementation Checklist

- [ ] PDF rendered in a background job, not blocking an HTTP request
      (unless volume is demonstrably low).
- [ ] Shared browser singleton with per-job page isolation.
- [ ] Page closed in `finally` block.
- [ ] Explicit timeouts set on all page operations.
- [ ] Currency and dates formatted with explicit locale.
- [ ] Generated PDF stored in persistent object storage.
- [ ] DB record updated with storage key/URL after upload.
- [ ] Multi-page overflow tested with realistic large data.
- [ ] Signature block has a fallback for pending signatures.
- [ ] Frontend shows loading/generating state while PDF is not yet ready.

"stop pdf-document-builder" or "normal mode": revert to normal coding behavior.
