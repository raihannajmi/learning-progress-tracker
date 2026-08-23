# 07 — Content Width, Dashboard Hierarchy & Dedicated Instructor IA

## 1. Latar Belakang & Masalah
Pada iterasi sebelumnya, terdapat beberapa kelemahan arsitektur visual dan struktur informasi:
1. **Content Clumping pada Desktop:** Konten halaman menempel langsung ke sisi kiri (tepat di samping sidebar) dengan ruang kosong masif di sisi kanan.
2. **Oversized Headline pada Dashboard:** Tag `<h1>` menampilkan seluruh kalimat pernyataan checklist yang panjang dari database (e.g. `Web Fundamentals & Semantic HTML: Saya memahami peran browser...`).
3. **Information Overload pada Monitoring Dosen:** Halaman `/admin` menampung tiga tugas besar yang tidak berhubungan sekaligus (KPI, Analitik Kebingungan, Mahasiswa Pasif, Bukti Submisi) dalam satu halaman panjang tanpa *drill-down*.

---

## 2. Solusi Arsitektural & Implementasi

### A. Responsive & Centered Container System
- Diatur pada `frontend/src/routes/__root.tsx`:
  - Padding horizontal bernapas: `px-4 sm:px-8 lg:px-12 py-8`.
  - Kontainer layout terpusat: `flex flex-col items-center`.
- Lebar spesifik per halaman dengan `mx-auto w-full`:
  - **Dashboard (`/dashboard`):** `max-w-3xl`
  - **Feed Kelas (`/class`):** `max-w-2xl`
  - **Sprint Belajar (`/sprints`):** `max-w-3xl`
  - **Roadmap & Checklist (`/roadmap`):** `max-w-4xl`
  - **Monitoring Hub & Halaman Dedicated:** `max-w-4xl` / `max-w-5xl`

### B. Perombakan Hierarki Dashboard Mahasiswa (`/dashboard`)
- **Struktur Informasi Alami:**
  1. *Konteks & Modul:* `Minggu 1 dari 8 • Web Fundamentals & Semantic HTML`
  2. *Judul Topik:* `Semantic HTML` (Singkat, jelas, tidak oversized)
  3. *Deskripsi / Pernyataan Target:* *"Saya memahami peran browser, client, server, HTTP request/response..."* (Teks sekunder yang nyaman dibaca)
  4. *Aksi Tunggal:* Satu tombol utama `[Mulai Sesi Fokus — 25 Menit]`.
- **Penguasaan Silabus Mandiri:**
  - Status teks ringkas: `12 / 49 kompetensi mandiri tercapai (24%)`.
  - Visualisasi progress kategori minimal tanpa 5 kotak bersarang.
  - Tautan tunggal `Lihat Roadmap & Checklist →`.
- **Aktivitas Pembelajaran Terbaru:**
  - Aliran kronologis aktivitas dengan tautan langsung ke `Feed & Diskusi Kelas →`.

### C. Dedicated Instructor Monitoring Architecture (Dosen / TA)
1. **`/admin` (Monitoring Kelas — Executive Overview Hub):**
   - Ringkasan KPI kesehatan kelas (Mahasiswa Aktif, Total Sprint, Feedback, Perlu Perhatian).
   - 3 Kartu Ikhtisar Ringkas dengan tombol aksi *drill-down* yang jelas:
     - Topik dengan Hambatan Terbanyak $\rightarrow$ `[Buka Analitik Hambatan Lengkap →]` (`/admin-confusions`)
     - Mahasiswa Perlu Perhatian $\rightarrow$ `[Periksa Semua Mahasiswa →]` (`/admin-attention`)
     - Bukti Pembelajaran Terbaru $\rightarrow$ `[Lihat Semua Bukti & Aktivitas →]` (`/admin-activity`)
2. **`/admin-confusions` (Hambatan Belajar / Analitik Topik — Halaman Khusus):**
   - Fokus murni pada analitik tingkat kesulitan materi, ranking topik, dan kutipan kendala refleksi mahasiswa.
3. **`/admin-attention` (Mahasiswa Perlu Perhatian — Halaman Khusus):**
   - Direktori mahasiswa dengan alasan intervensi yang eksplisit (`Tidak aktif selama 9 hari`, `Belum mencatat sprint minggu ini`).
4. **`/admin-activity` (Aktivitas & Bukti Belajar — Halaman Khusus):**
   - Aliran seluruh submission karya mahasiswa (GitHub, Loom, Live Demo) dengan tombol `[Buka di Feed & Diskusi →]` ke `/class`.

---

## 3. Hasil Verifikasi
- **Frontend Quality & Build:** `pnpm check && pnpm build` $\rightarrow$ **0 errors, 0 warnings (Client & SSR builds green)**.
- **Backend Automated Suite:** `pnpm tsx src/test-api.ts` $\rightarrow$ **12/12 automated test cases passed (100% success)**.
