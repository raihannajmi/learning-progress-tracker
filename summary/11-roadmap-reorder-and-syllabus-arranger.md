# 11 — Fitur Pengurutan Ulang & Reorder Silabus Silabus & Roadmap (`/admin-roadmap`)

Fitur untuk **menukar, mengatur ulang, dan mereorganisasi urutan minggu/pekan perkuliahan** pada silabus & roadmap kurikulum:

---

## 1. Fitur di Halaman `/admin-roadmap`

1. **Tombol Cepat 1-Klik ($\uparrow$ Naik / $\downarrow$ Turun) di Setiap Pekan:**
   - Pada setiap kartu minggu materi, tersedia tombol navigasi panah atas dan bawah.
   - Mengklik panah atas/bawah akan langsung menukar posisi minggu tersebut dengan minggu di atas/bawahnya secara otomatis dan menyimpan perubahan ke server.

2. **Modal Khusus "Atur Urutan Silabus" (Batch Reorder):**
   - Tombol **`[⇅ Atur Urutan Silabus]`** di header utama membuka modal daftar seluruh pekan (Minggu 1 s.d. N).
   - Pengajar dapat dengan bebas memindahkan urutan materi (misal: memindahkan materi Backend ke pekan-pekan awal, menukar pekan CSS dengan JavaScript, dsb).
   - Menampilkan nomor urut baru secara *real-time* sebelum menekan tombol **`[Simpan Urutan Baru]`**.

---

## 2. Implementasi Backend & Endpoint

- **Endpoint:** `PATCH /api/v1/admin/roadmap/weeks/reorder` (Hak akses `ADMIN` only).
- **Payload:**
  ```json
  {
    "weekOrders": [
      { "id": "uuid-minggu-a", "weekNumber": 1 },
      { "id": "uuid-minggu-b", "weekNumber": 2 }
    ]
  }
  ```
- **Database Transaction Protection:**
  Menggunakan transaksi database dua-fase (`db.transaction`) untuk menghindari *unique constraint collision* saat penomoran minggu saling bertukar tempat.
