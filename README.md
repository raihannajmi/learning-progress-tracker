# 🚀 Learning Progress Tracker (Web Development Course)

[![Node.js](https://img.shields.io/badge/Node.js-20+-68a063?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.0-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-c5f74f?style=flat-square&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169e1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Aplikasi web modern pemantauan progres belajar mandiri, refleksi kebiasaan coding (*habit tracking*), dan akuntabilitas rekan sebaya (*peer accountability*) untuk mahasiswa serta Dosen & Asisten Dosen (TA) perkuliahan Pengembangan Aplikasi Web.

---

## 🎯 Filosofi & Pendekatan Utama

1. **Progress, Bukan Nilai Angka (*Progress Over Grading*)**
   Tidak ada nilai huruf atau gradebook yang intimidatif. Fokus utama adalah mengukur kesiapan kemandirian coding mahasiswa (*"bisa coding mandiri tanpa tutorial"*).
2. **4-Tahap Self-Assessment Transparan**
   Setiap butir checklist materi dinilai secara mandiri oleh mahasiswa dalam 4 status:
   * ⚪ **Belum Dimulai (`NOT_STARTED`)**
   * 🟡 **Sedang Belajar Teori (`LEARNING`)**
   * 🔵 **Sedang Latihan Mandiri (`PRACTICING`)**
   * 🟢 **Bisa Bikin Mandiri (`CAN_DO_INDEPENDENTLY`)**
3. **25-Menit Learning Sprint & Habit Tracking**
   Mendorong kebiasaan belajar harian dengan target sesi minimal 25 menit. Setiap sprint mencatat:
   * Materi yang dipelajari & dipraktekkan
   * Refleksi hambatan / kebingungan (*confusing parts*)
   * Tautan bukti karya (*Evidence URL* — GitHub Repo, GitHub Pages, Loom, Figma, Live Demo)
   * Opsi *Request Feedback* dari Dosen/TA
4. **Feed Diskusi Kelas ala Media Sosial Modern**
   Feed interaktif dengan *progressive disclosure* komentar (2 komentar preview default, scroll kontainer aman), edit & hapus komentar *inline*, serta menu kelola sprint.
5. **Dashboard Asistensi Dosen & TA Proaktif**
   Dosen dan TA dapat memantau kesehatan seluruh kelas secara efisien:
   * Deteksi otomatis mahasiswa yang pasif / belum ada aktivitas (*Perlu Perhatian*)
   * Heatmap pola materi yang membingungkan (*Hambatan Belajar*)
   * Antrean khusus review submisi tugas (*Antrean Review Submisi*)

---

## ✨ Fitur-Fitur Utama

### 👨‍🎓 Portal Mahasiswa
* **Dashboard Fokus:** Ringkasan menit belajar, habit count (sprint $\ge 25$m), materi yang harus dipelajari berikutnya (*Next Action*), dan ringkasan penguasaan mandiri.
* **Roadmap & Silabus 8 Pekan:** Daftar lengkap topik & butir checklist materi dari dasar HTML, CSS, JavaScript DOM, API, Backend Node.js, Database, hingga Fullstack Deployment.
* **Timer & Logger Sesi Belajar (Sprint):** Stopwatch/timer fokus belajar interaktif, form refleksi, pemilihan topik silabus, dan upload link bukti karya.
* **Feed & Diskusi Kelas (`/class`):** Linimasa postingan belajar rekan sekelas, saling memberikan tanggapan konstruktif, serta filter berdasarkan kelas atau postingan butuh bantuan.

### 👩‍🏫 Portal Dosen & Asisten Dosen (Admin)
* **Monitoring Kelas (`/admin`):** Metrik komprehensif kehadiran sprint, mahasiswa aktif pekan ini, rata-rata durasi belajar, dan filter kelas terpadu.
* **Antrean Review Submisi (`/admin-review`):** Evaluasi tugas dan sprint mahasiswa, filter berdasarkan kebutuhan review, serta pemberian umpan balik dosen.
* **Hambatan Belajar (`/admin-confusions`):** Rekapitulasi topik dan materi yang paling banyak dikeluhkan mahasiswa untuk bahan evaluasi kuliah berikutnya.
* **Perlu Perhatian (`/admin-attention`):** Deteksi mahasiswa yang tidak aktif atau progresnya tertinggal untuk segera didampingi.
* **Aktivitas & Bukti (`/admin-activity`):** Log aktivitas belajar real-time beserta tautan repositori GitHub dan demo tugas mahasiswa.
* **Kelola Kelas & Jadwal (`/admin-classes`):** Manajemen kelas, semester akademik, serta tanggal mulai perkuliahan.
* **Kelola Mahasiswa (`/admin-students`):** Manajemen whitelist akun Google mahasiswa, impor batch CSV / JSON, pencarian cepat, dan penyaringan per kelas.
* **Kelola Dosen & TA (`/admin-instructors`):** Whitelist tim pengajar baru, pantauan metrik review yang telah diselesaikan, dan proteksi akun pengajar.
* **Kelola Roadmap & Silabus (`/admin-roadmap`):** Manajemen pekan, materi topik, dan butir checklist, pengurutan ulang (*reorder* pekan), serta pengaturan pekan aktif saat ini.

---

## 🛠️ Tech Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js 20+ (ESM) | High-performance async JavaScript runtime |
| **Web Framework** | Express.js 5.0 | RESTful API Engine |
| **Database & ORM** | PostgreSQL 16 + Drizzle ORM | Type-safe schema migrations & relational queries |
| **Validasi & Auth** | Zod + Google Auth Library + JWT | Strict schema validation & Whitelist-only Google OAuth |
| **Frontend Framework** | React 19 + TypeScript | UI Library modern |
| **Build Tool & Routing** | Vite 6 + TanStack Router (File-based) | Type-safe routing & fast HMR |
| **Server State & Store** | TanStack Query v5 + Zustand | Efficient caching & lightweight client state |
| **Styling & Icons** | Tailwind CSS v4 + Lucide Icons | Responsive modern design system |
| **Form Handling** | Formik + Yup | Robust client-side validation |
| **Containerization** | Docker & Docker Compose | Multi-stage production container build |

---

## 📁 Struktur Monorepo

```text
learning-progress-tracker/
├── backend/                  # RESTful API Backend (Express + Drizzle + Postgres)
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── db/               # Drizzle schema, client, migrations, & seeders
│   │   ├── middlewares/      # Auth & role guards, error handler, validator
│   │   ├── routes/           # API router endpoints
│   │   ├── services/         # Core business logic
│   │   ├── validators/       # Zod validation schemas
│   │   └── test-api.ts       # 13-suite automated verification script
│   ├── Dockerfile            # Multi-stage container build for backend
│   └── package.json
│
├── frontend/                 # Client Single Page App (Vite + React 19 + TanStack)
│   ├── src/
│   │   ├── components/       # Reusable UI components (Modal, Dropdown, Cards)
│   │   ├── lib/              # Axios API client & helpers
│   │   ├── routes/           # TanStack Router file-based pages
│   │   ├── stores/           # Zustand state stores (auth, timer, toast)
│   │   └── types/            # TypeScript shared interfaces
│   ├── index.html
│   └── package.json
│
├── summary/                  # Dokumentasi teknis & changelog setiap pembaruan
├── docker-compose.yml        # Local PostgreSQL container service
└── README.md
```

---

## 🚀 Panduan Menjalankan Secara Lokal (Local Setup)

### 1. Prasyarat
* **Node.js**: $\ge 20.x$
* **pnpm**: $\ge 9.x$ (`npm install -g pnpm`)
* **Docker Desktop**: Aktif untuk PostgreSQL lokal

---

### 2. Jalankan Database (Docker)
Jalankan PostgreSQL lokal di port `5434`:
```bash
docker compose up -d
```

---

### 3. Konfigurasi & Jalankan Backend
```bash
cd backend

# Salin environment file
cp .env.example .env

# Install dependensi
pnpm install

# Jalankan migrasi skema database
pnpm db:migrate

# Jalankan seeder data awal (Roadmap 8 Pekan, Kelas, Akun Dosen & Mahasiswa Demo)
pnpm db:seed

# Jalankan backend development server
pnpm dev
```
> Backend API berjalan di: **`http://localhost:5001`**

---

### 4. Konfigurasi & Jalankan Frontend
Buka terminal baru:
```bash
cd frontend

# Salin environment file
cp .env.example .env

# Install dependensi
pnpm install

# Jalankan frontend development server
pnpm dev
```
> Frontend client berjalan di: **`http://localhost:3000`**

---

## 🔑 Akun Demo (Instant Dev-Mock Login)

Di halaman login (`http://localhost:3000/`), sistem menyediakan tombol **Dev-Mock Quick Login** untuk pengujian instan tanpa perlu Google Client ID di mode development:

| Akun | Email | Role | Hak Akses |
| :--- | :--- | :--- | :--- |
| **Dosen Pengampu** | `dosen@univ.ac.id` | `ADMIN` | Akses penuh dashboard monitoring, review tugas, kelola kelas, roadmap, mahasiswa, & dosen |
| **Asisten Dosen (TA)** | `ta@univ.ac.id` | `ADMIN` | Akses monitoring kelas, review submisi tugas, dan analisis hambatan mahasiswa |
| **Andi Pratama** | `andi@student.univ.ac.id` | `STUDENT` | Mahasiswa Kelas Rabu Jam 10 DC 3A |
| **Citra Lestari** | `citra@student.univ.ac.id` | `STUDENT` | Mahasiswa Kelas Kamis Jam 7 D1 327 |

---

## 🧪 Pengujian & Verifikasi Otomatis

Aplikasi dilengkapi dengan suite pengujian otomatis end-to-end tanpa framework berat (*zero-dependency self-test runner*) yang memvalidasi seluruh alur bisnis:

```bash
cd backend
pnpm tsx src/test-api.ts
```

### Cakupan Pengujian (13 Skenario):
1. ✅ **Whitelist Security Guard:** Penolakan email non-whitelist (`403 NOT_WHITELISTED`).
2. ✅ **Student Authentication:** Validasi login mahasiswa & JWT claim.
3. ✅ **Admin Authentication:** Validasi login dosen & role claim `ADMIN`.
4. ✅ **4-State Checklist Self-Assessment:** Transisi status progres kurikulum.
5. ✅ **25-Minute Habit Sprint Logger:** Kalkulasi kualifikasi habit ($\ge 25$m).
6. ✅ **Peer Feedback & Instagram-style Comments:** Tambah, edit, dan hapus komentar sprint.
7. ✅ **Instructor Review Queue:** Pengambilan antrean review & submit evaluasi dosen.
8. ✅ **Student Dashboard KPIs:** Kalkulasi total menit belajar dan milestone roadmap.
9. ✅ **TA Dashboard Health Aggregation:** Agregasi mahasiswa pasif & deteksi hambatan.
10. ✅ **Paginated Student Search:** Pencarian server-side whitelist mahasiswa.
11. ✅ **Student Whitelist Registration:** Penambahan akun mahasiswa baru.
12. ✅ **Admin Roadmap & Syllabus CRUD:** Tambah pekan, topik, checklist, dan cascade delete.
13. ✅ **Admin Instructor / Dosen CRUD:** Whitelist akun pengajar baru, edit profil, dan proteksi hapus diri sendiri.

---

## 🚢 Panduan Deployment Produksi

### A. Backend Deployment (Easypanel / Docker / VPS)
* **Dockerfile Multi-Stage** siap pakai berada di direktori `backend/Dockerfile`.
* Port internal container: `5001`.
* **Environment Variables yang Dibutuhkan:**
  * `PORT=5001`
  * `NODE_ENV=production`
  * `DATABASE_URL=postgres://user:password@host:5432/dbname?sslmode=disable`
  * `JWT_SECRET=rahasia-jwt-production`
  * `JWT_EXPIRES_IN=7d`
  * `GOOGLE_CLIENT_ID=google-oauth-client-id.apps.googleusercontent.com`
  * `CORS_ORIGIN=https://nama-domain-frontend.netlify.app`
  * `CLIENT_URL=https://nama-domain-frontend.netlify.app`

### B. Frontend Deployment (Netlify)
* Direktori dasar build: `frontend`
* Build command: `pnpm build`
* Publish directory: `dist/client`
* **Environment Variables yang Dibutuhkan:**
  * `VITE_API_URL=https://api-domain-backend.easypanel.host/api`
  * `VITE_GOOGLE_CLIENT_ID=google-oauth-client-id.apps.googleusercontent.com`

---

## 📖 Dokumentasi Teknis Tambahan
Rangkuman teknis arsitektur lengkap dapat dibaca pada folder [`summary/`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary):
* [`01-backend-drizzle-implementation.md`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary/01-backend-drizzle-implementation.md) — Arsitektur RESTful API & Drizzle ORM
* [`09-production-deployment-easypanel-and-netlify.md`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary/09-production-deployment-easypanel-and-netlify.md) — Konfigurasi Deploy Easypanel & Netlify
* [`10-admin-classes-crud-and-schedule-management.md`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary/10-admin-classes-crud-and-schedule-management.md) — Manajemen Kelas & Jadwal Perkuliahan
* [`11-roadmap-reorder-and-syllabus-arranger.md`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary/11-roadmap-reorder-and-syllabus-arranger.md) — Fitur Drag & Reorder Silabus Pekan
* [`13-responsive-mobile-tablet-and-instagram-feed-comments.md`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary/13-responsive-mobile-tablet-and-instagram-feed-comments.md) — Responsivitas Mobile, Hybrid Cards, & Feed Ala Instagram
* [`14-instructor-admin-management-and-header-user-fix.md`](file:///Users/najmiraihan/Developer/learning-progress-tracker/summary/14-instructor-admin-management-and-header-user-fix.md) — Modul Kelola Dosen & Perbaikan Header Profil

---

## 📄 Lisensi
Dikembangkan untuk mendukung pembelajaran mandiri dan akuntabilitas perkuliahan mahasiswa Pengembangan Web.
