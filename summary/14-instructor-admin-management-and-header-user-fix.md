# 14 — Manajemen Dosen/TA & Perbaikan Indikator User Ganda

Pembaruan antarmuka dan backend untuk menambahkan modul manajemen Dosen/Asisten Dosen (Admin) serta memperbaiki indikator profil user yang sebelumnya tampil ganda di header dan sidebar.

---

## 1. Perbaikan Indikator User Ganda (`AppHeader.tsx`)
- **Masalah:** Pada tampilan desktop, profil pengguna (Avatar, Nama, dan Role) muncul dua kali secara bersamaan di pojok kanan atas (`AppHeader`) dan pojok kiri bawah (`AppSidebar`).
- **Solusi:**
  - Menghapus tampilan profil user redundan dari pojok kanan atas `AppHeader` pada desktop.
  - Menggantinya dengan badge konteks akademik resmi yang bersih: `Semester 2026/2027 Ganjil`.
  - Pada layar mobile (`lg:hidden`) saat sidebar tersembunyi dalam drawer, header tetap menampilkan avatar minimal.

---

## 2. Halaman Baru: Kelola Dosen & Tim Pengajar (`/admin-instructors`)

Halaman baru khusus Dosen/Admin untuk mengelola akun tim pengajar yang berhak login ke sistem melalui Google OAuth.

### 🌟 Fitur Utama:
1. **Daftar & Pencarian Instan:**
   - Menampilkan seluruh akun dengan role `ADMIN`.
   - Menampilkan total review submisi yang telah diselesaikan serta tanggapan diskusi yang diberikan masing-masing dosen.
   - Pencarian berdasarkan nama dosen atau email Google.
2. **Tampilan Responsif Mobile & Desktop:**
   - **📱 Mobile (`md:hidden`):** Kartu pengajar yang padat dengan avatar, role badge `DOSEN / TA`, status aktif, review counter, serta tombol aksi cepat (zero horizontal scroll).
   - **💻 Desktop (`hidden md:block`):** Tabel data dengan kolom nama & email, peran, review submisi, tanggapan diskusi, status, dan aksi.
3. **Tambah Dosen / TA Baru (Modal):**
   - Input nama lengkap & gelar.
   - Input email Google / Google Workspace resmi.
   - Terintegrasi langsung dengan whitelist Google OAuth sistem.
4. **Edit Profil & Status Keaktifan:**
   - Memperbarui nama dan email dosen.
   - Menonaktifkan/mengaktifkan akun pengajar.
   - **Proteksi:** Dosen tidak dapat menonaktifkan akunnya sendiri.
5. **Hapus Akses Dosen (Konfirmasi Aman):**
   - Dialog konfirmasi `ConfirmModal` varian *danger*.
   - **Proteksi:** Dosen tidak dapat menghapus akunnya sendiri (`CANNOT_DELETE_SELF`) dan sistem mewajibkan minimal tersisa 1 Dosen/Admin aktif (`LAST_ADMIN`).

---

## 3. Integrasi Navigasi Sidebar (`AppSidebar.tsx`)
- Menambahkan menu **"Kelola Dosen & TA"** ([`/admin-instructors`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-instructors.tsx)) dengan ikon `GraduationCap` tepat berdampingan dengan menu *Kelola Mahasiswa*.

---

## 4. Backend Endpoints Baru

| Method | Endpoint | Deskripsi | Authorization Guard |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/instructors` | List semua dosen/admin beserta metrik review | Admin |
| `POST` | `/admin/instructors` | Tambah dosen/admin baru ke whitelist Google OAuth | Admin |
| `PATCH` | `/admin/instructors/:id` | Edit nama/email/status aktif dosen | Admin |
| `DELETE` | `/admin/instructors/:id` | Hapus akun dosen (dengan proteksi self & last admin) | Admin |
