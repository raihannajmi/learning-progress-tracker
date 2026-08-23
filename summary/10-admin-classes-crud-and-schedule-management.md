# 10 — Halaman Manajemen Kelas & Jadwal Perkuliahan (`/admin-classes`)

Halaman dan fitur CRUD lengkap untuk **Manajemen Kelas & Jadwal Perkuliahan Resmi** bagi Dosen & Asisten Dosen:

---

## 1. Navigasi & Tampilan Sidebar

Telah ditambahkan menu baru di area Dosen/TA:
- **Menu Sidebar:** `Kelola Kelas & Jadwal` (`/admin-classes`) dengan ikon kalender (`Calendar`).
- **Header Breadcrumb:** `Area Dosen & Asisten Dosen • Manajemen Kelas & Jadwal`.

---

## 2. Fitur Halaman `/admin-classes`

1. **KPI Ringkasan Kelas:**
   - **Total Kelas:** Jumlah kelas perkuliahan terdaftar.
   - **Total Mahasiswa Terdaftar:** Akumulasi jumlah mahasiswa yang terdaftar di seluruh kelas.
   - **Kelas Aktif Perkuliahan:** Jumlah kelas yang tanggal mulai perkuliahannya sudah berjalan.

2. **Daftar & Status Perkuliahan Kelas:**
   - Nama Kelas (contoh: `Rabu, Jam 10 DC 3A`, `Kamis, Jam 7 D1 327`).
   - Tahun Ajaran / Semester (contoh: `2026/2027 Ganjil`).
   - Tanggal Mulai Resmi (contoh: `Rabu, 19 Agustus 2026` / `Kamis, 20 Agustus 2026`).
   - Status Badge: `Perkuliahan Berjalan` (hijau) atau `Mulai Mendatang` (kuning).
   - Tautan langsung ke mahasiswa kelas tersebut (`46 Mahasiswa Terdaftar →` menuju `/admin-students?classId=...`).

3. **Operasi CRUD Lengkap:**
   - **[+ Tambah Kelas Baru]:** Modal untuk input Nama Kelas, Semester, dan Tanggal Mulai Perkuliahan (`<input type="date" />`).
   - **[Edit Kelas & Jadwal]:** Mengubah tanggal mulai, nama, atau semester kapan saja.
   - **[Hapus Kelas]:** Proteksi keamanan yang mencegah penghapusan jika masih ada mahasiswa terdaftar di kelas tersebut.

---

## 3. Integrasi Backend & API

- `GET /api/v1/classes` $\rightarrow$ Mengembalikan daftar kelas beserta `startDate` dan `studentCount`.
- `POST /api/v1/classes` $\rightarrow$ Membuat kelas baru (`ADMIN` only).
- `PATCH /api/v1/classes/:id` $\rightarrow$ Mengubah data kelas & tanggal mulai (`ADMIN` only).
- `DELETE /api/v1/classes/:id` $\rightarrow$ Menghapus kelas dengan validasi zero-student (`ADMIN` only).
- `GET /api/v1/dashboard/admin` $\rightarrow$ Menggunakan `startDate` kelas untuk menghitung status keaktifan mahasiswa.
