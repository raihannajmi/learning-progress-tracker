# 08 — Database-Driven Architecture & Dual Seed System (Dev vs Prod)

## 1. Latar Belakang & Prinsip
Semua data di dalam aplikasi tidak boleh di-hardcode di kode program. Seluruh entitas — mulai dari kelas akademik, daftar whitelist mahasiswa, akun pengajar/dosen/TA, silabus kurikulum 8 minggu, butir checklist self-assessment, hingga sesi sprint dan diskusi feedback — harus sepenuhnya bersumber dinamis dari basis data PostgreSQL.

Disediakan **2 profil seeding independen**:
1. **Seed Development / Local (`pnpm db:seed:dev` atau `pnpm db:seed`):** Untuk pengembangan lokal dan demonstrasi interaktif.
2. **Seed Production (`pnpm db:seed:prod`):** Untuk inisialisasi lingkungan live production yang bersih tanpa data dummy.

---

## 2. Struktur Data Sumber Terpusat (`backend/src/db/data/`)

- [`classes.ts`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/src/db/data/classes.ts): Berisi 2 kelas akademik resmi (`Rabu, Jam 10 DC 3A` dan `Kamis, Jam 7 D1 327`).
- [`students.ts`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/src/db/data/students.ts): Berisi 92 mahasiswa whitelist resmi dari data perkuliahan dengan NIM, nama, kelas, dan email universitas.
- [`curriculum.ts`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/src/db/data/curriculum.ts): Berisi silabus lengkap 8 Minggu Web Development (Minggu 1 HTML/CSS sampai Minggu 8 Cloud Deployment & Capstone) beserta seluruh topik materi dan butir pernyataan evaluasi mandiri dari `Reflection.md`.

---

## 3. Profil Seeding

### A. Production Seed ([`seed-prod.ts`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/src/db/seed-prod.ts))
Dijalankan dengan perintah:
```bash
pnpm db:seed:prod
```
**Yang diisi:**
- 2 Kelas Akademik
- 3 Akun Pengajar Whitelist (Alif Najmi Raihan `najmiraihanworks@gmail.com`, Dosen Pengampu, TA)
- 92 Mahasiswa Whitelist dengan pemetaan kelas masing-masing
- 8 Minggu Silabus Kurikulum Lengkap + Seluruh Topik & Checklist Pernyataan Mandiri
- **0 Sprint Dummy / 0 Komentar Palsu / 0 Data Bohongan (Clean Slate siap semester baru)**

---

### B. Development Seed ([`seed-dev.ts`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/src/db/seed-dev.ts))
Dijalankan dengan perintah:
```bash
pnpm db:seed:dev
# atau
pnpm db:seed
```
**Yang diisi:**
- Seluruh baseline data production
- 35+ Mahasiswa dengan berbagai variasi status progres checklist (`LEARNING`, `PRACTICING`, `CAN_DO_INDEPENDENTLY`)
- 25 Sesi Learning Sprint dengan catatan refleksi kode realistis, durasi variatif (habit $\ge 25\text{m}$), dan bukti URL (GitHub/Loom)
- Utas diskusi peer feedback & asistensi dosen yang diverifikasi
- Agregasi analitik hambatan belajar (*Common Confusions*) dan deteksi mahasiswa pasif langsung aktif

---

## 4. Tracing & Penghapusan Hardcoded Fallbacks

1. **[`dashboardService.ts`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/src/services/dashboardService.ts):**
   - Mengambil data minggu silabus, judul modul, topik, dan checklist secara murni dari query JOIN database (`roadmapWeeks`, `topics`, `checklistItems`).
   - Ekstraksi *Common Confusions* mencocokkan teks kendala mahasiswa langsung terhadap daftar topik di database (`topics`), bukan dari array statis.
   - Bila belum ada kendala yang dilaporkan, mengembalikan array kosong `[]` sehingga UI menampilkan `EmptyState` yang elegan tanpa data buatan.
2. **Paket Perintah NPM ([`package.json`](file:///Users/najmiraihan/Developer/learning-progress-tracker/backend/package.json)):**
   - Ditambahkan `"db:seed:dev"` dan `"db:seed:prod"`.

---

## 5. Hasil Verifikasi

| Pengujian | Hasil |
| :--- | :--- |
| **Production Seed (`pnpm db:seed:prod`)** | ✅ **Passed (Clean baseline seeded)** |
| **Development Seed (`pnpm db:seed:dev`)** | ✅ **Passed (Rich interactive data seeded)** |
| **Backend Automated Test Suite (`pnpm tsx src/test-api.ts`)** | ✅ **12/12 test cases passed (100%)** |
| **Frontend Linters & Production Build (`pnpm check && pnpm build`)** | ✅ **0 errors, 0 warnings** |
