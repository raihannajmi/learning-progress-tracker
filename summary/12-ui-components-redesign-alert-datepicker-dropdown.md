# 12 — Redesain Komponen UI: Alert Toast, DatePicker, SelectDropdown, & ConfirmModal

Peningkatan sistem komponen antarmuka pengguna (UI/UX) untuk menggantikan elemen bawaan browser (`alert()`, `confirm()`, native `<select>`, unstyled `<input type="date">`) dengan komponen modern, konsisten, dan berstandar *rich aesthetics*.

---

## 1. Komponen Baru yang Dibuat

### 🔔 1. Toast Notification System (`ToastContainer.tsx` & `toastStore.ts`)
- **Fitur:**
  - Menggantikan pesan `alert()` bawaan browser yang kaku.
  - Floating toast di pojok kanan bawah dengan efek glassmorphism, border halus, ikon status, dan animasi slide-in.
  - Varian lengkap: `toast.success()`, `toast.error()`, `toast.warning()`, dan `toast.info()`.
  - Auto-dismiss (4 detik) atau dapat ditutup manual dengan tombol `✕`.

---

### 📅 2. Custom DatePicker (`DatePicker.tsx`)
- **Fitur:**
  - Menggantikan input kalender native browser.
  - Menampilkan tanggal dalam format lokal bahasa Indonesia yang rapi (contoh: `Rabu, 19 Agustus 2026`).
  - Popover kalender interaktif dengan navigasi bulan/tahun, penanda tanggal hari ini, tombol reset/clear 1-klik, dan tombol cepat "Hari Ini".
  - Terintegrasi langsung dengan formik pada halaman Kelola Kelas & Jadwal (`/admin-classes`).

---

### 🔽 3. Custom SelectDropdown (`SelectDropdown.tsx`)
- **Fitur:**
  - Menggantikan elemen `<select>` bawaan browser di seluruh rute.
  - Dilengkapi badge kategori, deskripsi opsi, ikon, dan checkmark aktif.
  - Fitur pencarian instan (`searchable`) untuk daftar panjang (misalnya pemilihan topik materi pada Learning Sprint).
  - Tombol *reset* / *clear* (`allowClear`).

---

### ⚠️ 4. Modern Confirm Dialog Modal (`ConfirmModal.tsx`)
- **Fitur:**
  - Menggantikan fungsi `window.confirm()`.
  - Modal konfirmasi dengan varian warna semantik:
    - **Danger** (Merah/Rose) untuk penghapusan kelas, mahasiswa, dan silabus.
    - **Warning** (Kuning/Amber) untuk pembatalan sesi fokus sprint.
    - **Primary** (Biru) untuk aksi penting lainnya.
  - Menampilkan judul jelas, deskripsi konsekuensi tindakan, dan *loading state* saat mutasi berjalan.

---

## 2. Halaman-Halaman yang Telah Diperbarui & Diredesain

1. **[`/admin-classes`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-classes.tsx):**
   - Menggunakan `DatePicker` untuk tanggal mulai perkuliahan resmi.
   - Menggunakan `ConfirmModal` untuk konfirmasi hapus kelas.
   - Menggunakan `toast` untuk feedback simpan/edit/hapus kelas.

2. **[`/admin-students`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-students.tsx):**
   - Menggunakan `SelectDropdown` pada filter kelas, modal tambah mahasiswa, dan modal impor batch.
   - Menggunakan `ConfirmModal` saat menghapus mahasiswa dari whitelist.
   - Menggunakan `toast` untuk hasil impor JSON/CSV dan notifikasi mutasi.

3. **[`/admin-roadmap`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-roadmap.tsx):**
   - Menggunakan `SelectDropdown` untuk memilih kategori topik (HTML, CSS, JS, Backend, Fullstack).
   - Menggunakan `ConfirmModal` untuk penghapusan pekan, topik, dan butir checklist.
   - Menggunakan `toast` pada setiap aksi reorder dan CRUD silabus.

4. **[`/sprints`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/sprints.tsx) & [`ActiveSessionBanner`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/components/common/ActiveSessionBanner.tsx):**
   - Menggunakan `SelectDropdown` yang dapat dicari (`searchable`) untuk memilih topik materi silabus.
   - Menggunakan `ConfirmModal` saat membatalkan sesi fokus aktif.

5. **[`/class`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/class.tsx), [`/admin-review`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-review.tsx), [`/admin-activity`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-activity.tsx), [`/admin-confusions`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin-confusions.tsx), [`/admin`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/src/routes/admin.tsx):**
   - Seluruh *filter dropdown* kelas diperbarui menggunakan `SelectDropdown` dengan pill badges semester.
