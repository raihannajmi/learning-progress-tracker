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

## 2. Peningkatan Responsif Mobile & Tablet Viewport Ergonomics

1. **Layout & Padding Global (`__root.tsx`):**
   - Padding container disesuaikan menjadi `px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7` agar tidak sempit pada layar mobile 320px–375px.
2. **Navigasi Sidebar (`AppSidebar.tsx`):**
   - Menambahkan rute `/admin-review` (*Antrean Review Submisi*) dengan ikon `ClipboardCheck` ke dalam menu sidebar pengajar.
   - Drawer mobile off-canvas dengan animasi slide-in dan backdrop blur halus.
3. **Checklist & Touch Targets (`SelfAssessmentButton.tsx` & `roadmap.tsx`):**
   - Menjamin seluruh badge tombol status checklist memiliki touch target nyaman ($\ge 44\text{px}$ pada mobile).
4. **Modal & Dialog Scrollability (`admin-students.tsx`, `admin-classes.tsx`, `SprintModal.tsx`):**
   - Semua modal form dibungkus dengan `max-h-[90dvh] overflow-y-auto` agar tidak terpotong saat keyboard virtual smartphone terbuka.

---

## 3. Backend Endpoints & Validasi Baru

| Method | Endpoint | Deskripsi | Authorization Guard |
| :--- | :--- | :--- | :--- |
| `PATCH` | `/sprints/:id/feedbacks/:feedbackId` | Memperbarui teks komentar | Author komentar atau Admin |
| `DELETE` | `/sprints/:id/feedbacks/:feedbackId` | Menghapus komentar | Author komentar atau Admin |
| `PATCH` | `/sprints/:id` | Memperbarui data refleksi sprint | Pemilik sprint atau Admin |
| `DELETE` | `/sprints/:id` | Menghapus sprint & diskusinya | Pemilik sprint atau Admin |
