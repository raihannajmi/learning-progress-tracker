# Summary 01: Backend & Database Implementation (Drizzle ORM + Express + Google Auth)

**Date:** 2026-08-22  
**Status:** Completed & 100% Verified  
**Stack:** Node.js, Express.js (v5), TypeScript, PostgreSQL (Docker container on port 5434), Drizzle ORM, Zod, Google Auth Library, JWT.

---

## 1. Key Architectural Decisions

1. **Dedicated Database Container:**
   - Docker container `learning_tracker_db` running PostgreSQL 16 on port `5434`.
   - `DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5434/learning_progress_tracker`.

2. **Drizzle ORM + PostgreSQL Schema (`backend/src/db/schema.ts`):**
   - **`classes`**: `id` (uuid), `name` ("Kelas A", "Kelas B"), `academic_term`, `created_at`.
   - **`users`**: `id`, `name`, `email` (unique), `nim` (unique nullable), `role` (`STUDENT` | `ADMIN`), `class_id`, `github_repo_url`, `github_page_url`, `avatar_url`, `is_active`, `created_at`.
   - **`roadmap_weeks`**: `id`, `week_number` (1..8), `title`, `description`, `is_current`, `created_at`.
   - **`topics`**: `id`, `week_id`, `title`, `category` (`HTML`, `CSS`, `JAVASCRIPT`, `BACKEND`, `FULLSTACK`), `sort_order`.
   - **`checklist_items`**: `id`, `topic_id`, `statement`, `sort_order`.
   - **`checklist_progress`**: `id`, `user_id`, `checklist_item_id`, `status` (`NOT_STARTED`, `LEARNING`, `PRACTICING`, `CAN_DO_INDEPENDENTLY`), `updated_at`. Unique index on `[user_id, checklist_item_id]`.
   - **`learning_sprints`**: `id`, `user_id`, `topic_id`, `duration_minutes`, `what_learned`, `what_practiced`, `confusing_parts`, `evidence_url`, `evidence_type` (`GITHUB`, `GITHUB_PAGES`, `LOOM`, `FIGMA`, `LIVE_DEMO`, `OTHER`), `created_at`.
   - **`peer_feedback`**: `id`, `sprint_id`, `author_id`, `comment`, `created_at`.
   - **`external_milestones`**: `id`, `user_id`, `milestone_type`, `status`, `certificate_url`, `updated_at`.

3. **Authentication Strategy (100% Server-Side Verification — No Public Register):**
   - Only pre-whitelisted users added by Admin (Dosen/TA) or Seed can access the application.
   - Endpoint: `POST /api/v1/auth/google/verify`
   - Flow:
     1. Frontend sends Google credential token.
     2. Backend verifies signature with `google-auth-library` (`OAuth2Client`).
     3. Backend checks if `email` exists in `users` table.
     4. If not found $\rightarrow$ `403 Forbidden` (`NOT_WHITELISTED`).
     5. If found $\rightarrow$ signs JWT with `{ userId, email, role, classId }` and returns user profile.
   - Dev mode support: `dev-mock:email@domain.com` allows instant local testing against seeded/whitelisted emails without requiring live Google console credentials.

4. **Roles (2 Roles Only):**
   - **`ADMIN`**: Dosen & Teaching Assistant. Can whitelist students, manage classes, and view TA Monitoring Dashboard.
   - **`STUDENT`**: Can toggle 4-state self-assessment checklist, log 25-min learning sprints with reflections, and give peer feedback.

---

## 2. API Endpoints Map

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/v1/auth/google/verify` | `POST` | Public | Verify Google token, check whitelist, issue JWT |
| `/api/v1/auth/me` | `GET` | Authenticated | Current logged-in user profile & class |
| `/api/v1/classes` | `GET` | Authenticated | List all classes and student counts |
| `/api/v1/classes` | `POST` | ADMIN | Create a new class |
| `/api/v1/admin/students` | `GET` | ADMIN | List all whitelisted students with metrics |
| `/api/v1/admin/students` | `POST` | ADMIN | Add single student to whitelist |
| `/api/v1/admin/students/batch` | `POST` | ADMIN | Batch add students to whitelist |
| `/api/v1/admin/students/:id` | `PATCH` | ADMIN | Update student profile/class/active status |
| `/api/v1/admin/students/:id` | `DELETE` | ADMIN | Remove student from whitelist |
| `/api/v1/roadmap` | `GET` | Authenticated | Full 8-week syllabus with topics & checklist progress |
| `/api/v1/checklists/my-progress` | `GET` | Authenticated | Current user's checklist status |
| `/api/v1/checklists/progress` | `POST` | Authenticated | Upsert self-assessment state (`NOT_STARTED`, `LEARNING`, `PRACTICING`, `CAN_DO_INDEPENDENTLY`) |
| `/api/v1/sprints` | `GET` | Authenticated | List sprints (paginated, filtered by class/user) |
| `/api/v1/sprints` | `POST` | Authenticated | Log 25-min learning sprint with reflection & evidence |
| `/api/v1/sprints/:id` | `GET` | Authenticated | Detail sprint with peer feedbacks |
| `/api/v1/sprints/:id/feedbacks` | `POST` | Authenticated | Add qualitative peer feedback |
| `/api/v1/dashboard/student` | `GET` | Authenticated | Student dashboard KPIs (domain progress %, habit count, next action) |
| `/api/v1/dashboard/admin` | `GET` | ADMIN | TA/Dosen dashboard (class progress, confusion aggregator, inactive students filter) |

---

## 3. Automated Test & Verification Results

All 9 automated backend test suites passed:
- `1️⃣ Testing Non-Whitelisted Email Login` $\rightarrow$ Passed (403 `NOT_WHITELISTED`).
- `2️⃣ Testing Whitelisted Student Login` $\rightarrow$ Passed (JWT issued).
- `3️⃣ Testing Whitelisted Admin Login` $\rightarrow$ Passed (Role `ADMIN`).
- `4️⃣ Testing Roadmap & 4-State Checklist Self-Assessment` $\rightarrow$ Passed (Progress state updated).
- `5️⃣ Testing 25-Minute Learning Sprint Logger` $\rightarrow$ Passed (`isHabitQualified = true` for $\ge$25m).
- `6️⃣ Testing Peer Feedback` $\rightarrow$ Passed (Comment attached to sprint).
- `7️⃣ Testing Student Dashboard` $\rightarrow$ Passed (KPIs and domain progress percentages calculated).
- `8️⃣ Testing TA/Admin Dashboard` $\rightarrow$ Passed (Confusion mentions aggregated, inactive students filtered).
- `9️⃣ Testing Admin Adding New Student to Whitelist` $\rightarrow$ Passed (New student whitelisted and logged in).
