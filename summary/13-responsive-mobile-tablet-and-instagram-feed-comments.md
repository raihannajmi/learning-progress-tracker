# 13 — Peningkatan Responsif Mobile/Tablet & Fitur Feed Interaktif (Edit, Hapus, & Truncate Komentar ala Instagram)

Pembaruan arsitektur antarmuka dan backend untuk mengoptimalkan pengalaman pengguna di layar smartphone dan tablet, serta meredesain feed diskusi kelas agar interaktif layaknya media sosial modern (Instagram).

---

## 1. Fitur Feed Diskusi Kelas ala Instagram (`PeerFeedbackCard.tsx`)

### 💬 A. Progressive Disclosure & Anti-Bloat Komentar
- **Masalah:** Postingan dengan banyak komentar sebelumnya meregang memanjang (*infinite vertical stretch*) hingga ribuan piksel dan merusak keterbacaan feed di mobile.
- **Solusi:**
  - Menampilkan **2 komentar terbaru** secara default.
  - Tombol interaktif `Lihat semua (N) komentar` untuk memperluas thread.
  - Kontainer scroll internal berbatas tinggi (`max-h-72 sm:max-h-80 overflow-y-auto pr-1.5`) sehingga tinggi kartu tetap terkontrol dan ergonomis.
  - Tombol dapat diklik kembali untuk `Sembunyikan komentar`.

### ✏️ B. Edit & Hapus Pesan Komentar Inline
- Tombol menu `•••` (muncul saat hover atau tap pada mobile) khusus untuk pemilik komentar atau Pengajar/Admin.
- **Edit Inline:** Mengubah teks komentar menjadi textarea in-place dengan tombol *Simpan* dan *Batal* (dapat dibatalkan dengan tombol Esc atau Enter untuk kirim).
- **Hapus Komentar:** Konfirmasi dialog aman menggunakan `ConfirmModal` (varian *danger*).
- **Format Waktu Relatif Lokal:** Menampilkan waktu ramah seperti `baru saja`, `10m lalu`, `2j lalu`, `kemarin`.

### 📌 C. Opsi Pengelolaan Sesi Belajar (Sprint Owner / Admin)
- Menu `•••` pada sudut kanan atas kartu sprint untuk pemilik postingan atau Pengajar/Admin:
  - **Edit Sesi Belajar:** Membuka `SprintModal` untuk memperbarui materi, apa yang dipelajari, praktek, kendala, dan bukti URL.
  - **Hapus Sesi Belajar:** Dialog konfirmasi aman untuk menghapus sesi sprint beserta seluruh diskusinya.

---

## 2. Solusi Total Masalah "Geser-Geser Kanan-Kiri" (Horizontal Scroll Elimination)

### 🔍 Akar Penyebab (Root Cause Analysis):
1. **Flex Container Expansion:** Default CSS flex container (`min-width: auto`) membuat container utama meregang selebar konten terluas di dalamnya alih-alih terbatasi oleh lebar viewport smartphone/tablet.
2. **Side-by-side Badge Clusters:** Pada `admin-review.tsx`, 4 elemen (HabitBadge, Evidence Link, ReviewStatus, Button) berada dalam satu baris kaku tanpa `flex-wrap` dan memakai `shrink-0` (total lebar $\approx 440\text{px}$). Pada layar smartphone 360px–390px, hal ini mendorong seluruh halaman keluar batas kanan layar.
3. **Data Table 6 Kolom di Layar Kecil:** Pada `admin-students.tsx`, tabel 6 kolom memaksa container melebar jika tidak ditangani dengan tampilan kartu responsif pada mobile.

### 🛠️ Solusi yang Diimplementasikan:
1. **Layout Wrapper (`__root.tsx`):**
   - Menambahkan `min-w-0 max-w-full overflow-x-hidden` pada container flex root dan `<main>`.
2. **Hybrid Mobile Cards di `/admin-students`:**
   - **Layar Mobile (`md:hidden`):** Menampilkan daftar kartu mahasiswa yang padat, rapi, dan responsif dengan avatar, nama, email, NIM, badge kelas, jumlah progres, jumlah sprint, serta tombol aksi cepat tanpa geser horizontal.
   - **Layar Tablet & Desktop (`hidden md:block`):** Menampilkan tabel data lengkap dengan `overflow-x-auto`.
3. **Responsive Actions Wrap di `/admin-review`:**
   - Menambahkan `flex-wrap` dan `min-w-0` pada action cluster sehingga badge status dan tombol review bertumpuk secara rapi pada layar sempit tanpa mendorong lebar halaman.
4. **Responsive Pagination (`Pagination.tsx`):**
   - Tombol navigasi halaman dan range data membungkus (*wrap*) secara fleksibel di layar smartphone.
5. **Standardisasi Seluruh Halaman Admin:**
   - Semua rute (`/admin`, `/admin-attention`, `/admin-activity`, `/admin-confusions`, `/admin-roadmap`, `/admin-classes`, `/class`, `/dashboard`, `/sprints`, `/roadmap`) kini menerapkan `min-w-0 max-w-full` secara konsisten.

---

## 3. Backend Endpoints & Validasi Baru

| Method | Endpoint | Deskripsi | Authorization Guard |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/sprints/:id/feedbacks/:feedbackId` | Memperbarui teks komentar | Author komentar atau Admin |
| `DELETE` | `/sprints/:id/feedbacks/:feedbackId` | Menghapus komentar | Author komentar atau Admin |
| `PATCH` | `/sprints/:id` | Memperbarui data refleksi sprint | Pemilik sprint atau Admin |
| `DELETE` | `/sprints/:id` | Menghapus sprint & diskusinya | Pemilik sprint atau Admin |
