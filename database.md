# Database Schema & Class Data Template

Dokumen ini memuat struktur skema database PostgreSQL dan format data template untuk batch import kelas dan mahasiswa whitelist.

---

## 1. Academic Classes (Kelas Akademik)

| Nama Kelas | Tahun Akademik | Keterangan |
| :--- | :--- | :--- |
| `Rabu, Jam 10 DC 3A` | `2026/2027 Ganjil` | Kelas Web Development Sesi Rabu |
| `Kamis, Jam 7 D1 327` | `2026/2027 Ganjil` | Kelas Web Development Sesi Kamis |

---

## 2. Format Template Batch Whitelist Mahasiswa (CSV / Tab-Separated)

Dosen atau Asisten Dosen dapat mengimpor data mahasiswa ke dalam sistem melalui halaman **/admin-students** dengan format:

```csv
email,name,nim,className
student.01@demo.univ.ac.id,Budi Santoso,2404140001,"Rabu, Jam 10 DC 3A"
student.02@demo.univ.ac.id,Siti Rahmawati,2404140002,"Rabu, Jam 10 DC 3A"
student.03@demo.univ.ac.id,Ahmad Fauzi,2404140003,"Rabu, Jam 10 DC 3A"
student.04@demo.univ.ac.id,Dewi Lestari,2404140004,"Rabu, Jam 10 DC 3A"
student.05@demo.univ.ac.id,Rizky Pratama,2404140005,"Rabu, Jam 10 DC 3A"
student.16@demo.univ.ac.id,Yunita Sari,2404140016,"Kamis, Jam 7 D1 327"
student.17@demo.univ.ac.id,Hendra Gunawan,2404140017,"Kamis, Jam 7 D1 327"
```

> [!NOTE]
> Untuk deployment lokal/production privat pengampu kelas, letakkan file `students.private.json` di direktori `backend/src/db/data/` (file ini otomatis diabaikan oleh `.gitignore` sehingga data real mahasiswa tidak akan ter-push ke public GitHub).

---

## 3. Data Entities & Relasi Tabel

1. **`classes`**: Menyimpan daftar rombel/kelas perkuliahan.
2. **`users`**: Akun mahasiswa & pengajar (`role: STUDENT | ADMIN`), whitelist Google OAuth, serta metadata GitHub portfolio.
3. **`roadmap_weeks`**: Minggu kurikulum silabus 1 s.d. 8.
4. **`topics`**: Topik materi dalam tiap minggu (`HTML | CSS | JAVASCRIPT | BACKEND | FULLSTACK`).
5. **`checklist_items`**: Butir pernyataan evaluasi mandiri (*self-assessment* 4-state).
6. **`checklist_progress`**: Progres status tiap mahasiswa terhadap butir checklist (`NOT_STARTED | LEARNING | PRACTICING | CAN_DO_INDEPENDENTLY`).
7. **`learning_sprints`**: Catatan sesi fokus belajar ($25\text{m}$ habit standard, refleksi kode, kendala belajar, link bukti submission).
8. **`peer_feedback`**: Tanggapan dan review dari sesama mahasiswa dan dosen/TA.