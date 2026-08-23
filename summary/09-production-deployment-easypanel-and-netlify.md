# 09 — Production Deployment Guide: Easypanel (Backend + DB) & Netlify (Frontend)

Panduan lengkap deployment production untuk platform **Learning Progress Tracker**:

---

## 1. Arsitektur Deployment

```mermaid
graph LR
    User[Mahasiswa & Dosen] -->|HTTPS| FE[Frontend on Netlify]
    FE -->|REST API & Bearer JWT| BE[Backend on Easypanel]
    BE -->|SQL Pool| DB[(PostgreSQL on Easypanel)]
```

- **Frontend:** Netlify (Global CDN, Single Page App redirect, zero server maintenance).
- **Backend & Database:** Easypanel (VPS Docker Hosting: Express API + PostgreSQL Service).

---

## 2. Langkah 1: Setup Database & Backend di Easypanel

### A. Buat Database PostgreSQL di Easypanel
1. Buka dashboard Easypanel $\rightarrow$ Buat **Project** (e.g. `learning-tracker`).
2. Klik **+ Service** $\rightarrow$ Pilih **Database: PostgreSQL**.
3. Buat service (e.g. name: `postgres-db`).
4. Catat Connection String internal yang diberikan oleh Easypanel (contoh: `postgres://postgres:password@postgres-db:5432/learning_tracker`).

---

### B. Buat Backend Service di Easypanel
1. Di project yang sama, klik **+ Service** $\rightarrow$ Pilih **App**.
2. **Source Code:** Hubungkan repository GitHub Anda.
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Type:** Pilih **Dockerfile** (otomatis menggunakan `backend/Dockerfile`).
3. **Environment Variables:** Masukkan variabel berikut di tab *Environment*:

| Variabel | Contoh Nilai | Keterangan |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Mode produksi |
| `PORT` | `5001` | Port container |
| `DATABASE_URL` | `postgres://postgres:pass@postgres-db:5432/learning_tracker` | URL koneksi ke service Postgres Easypanel |
| `JWT_SECRET` | `generate-random-secret-key-32-chars-minimum` | Kunci enkripsi token login |
| `GOOGLE_CLIENT_ID` | `your-id.apps.googleusercontent.com` | Google OAuth Web Client ID |
| `CLIENT_URL` | `https://learningtracker.netlify.app` | URL domain Frontend Anda di Netlify (untuk CORS) |

4. **Port Mapping / Domain:**
   - Tambahkan domain/subdomain di tab *Domains* (contoh: `api.domainanda.com` $\rightarrow$ port `5001`).

---

## 3. Cara Memasukkan Mahasiswa di Production (Easypanel)

Ada **2 cara mudah dan fleksibel** untuk memasukkan 92+ mahasiswa ke sistem:

### Cara 1: Lewat Web UI Admin Panel (Paling Mudah & Praktis ⭐)
1. Buka website Anda yang sudah live, lalu login dengan Google menggunakan email Dosen/Admin (`najmiraihanworks@gmail.com`).
2. Masuk ke menu **Kelola Mahasiswa** (`/admin-students`).
3. Klik tombol **[Impor Batch CSV]**.
4. Paste daftar mahasiswa dari file spreadsheet/format CSV:
   ```csv
   email,name,nim,className
   mahasiswa1@students.univ.ac.id,Nama Mahasiswa 1,2504140001,"Rabu, Jam 10 DC 3A"
   mahasiswa2@students.univ.ac.id,Nama Mahasiswa 2,2504140002,"Kamis, Jam 7 D1 327"
   ```
5. Klik **[Verifikasi & Simpan Mahasiswa]** $\rightarrow$ Semua mahasiswa otomatis tersimpan ke PostgreSQL!

---

### Cara 2: Lewat Terminal Easypanel (Inisialisasi Seed Langsung)
1. Di Easypanel, buka service **Backend App** $\rightarrow$ Tab **Console / Terminal**.
2. Jalankan perintah migrasi & seed resmi:
   ```bash
   pnpm db:migrate
   pnpm db:seed:prod
   ```
3. Database akan otomatis terisi dengan 2 Kelas Akademik, Akun Admin Dosen, dan Silabus Kurikulum 8 Minggu tanpa data dummy!

---

## 4. Langkah 2: Setup Frontend di Netlify

1. Buka dashboard **Netlify** $\rightarrow$ **Add new site** $\rightarrow$ **Import an existing project** dari GitHub.
2. **Build Settings:**
   - **Base directory:** `frontend`
   - **Build command:** `pnpm build`
   - **Publish directory:** `dist/client`
3. **Environment Variables:** Masukkan variabel berikut di Netlify:

| Variabel | Nilai |
| :--- | :--- |
| `VITE_API_URL` | `https://api.domainanda.com/api` *(URL backend Easypanel Anda)* |
| `VITE_GOOGLE_CLIENT_ID` | `your-id.apps.googleusercontent.com` |

4. Klik **Deploy site**.
5. Netlify akan otomatis membaca [`netlify.toml`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/netlify.toml) yang telah dikonfigurasi dengan SPA redirect `/* -> /index.html`.

> [!TIP]
> **Keamanan UI Login di Production:**  
> Komponen simulasi akun demo (Dev Mode) telah diproteksi dengan `import.meta.env.DEV`. Saat dibuild dan di-deploy ke Netlify, kotak simulasi demo **otomatis hilang total**, sehingga mahasiswa hanya melihat tombol resmi **"Sign in with Google"**!

---

## 5. Disiplin Database Migration (Drizzle)

Setiap kali Anda mengubah struktur tabel di `backend/src/db/schema.ts`:
1. Buat file migrasi SQL baru:
   ```bash
   pnpm db:generate
   ```
   *(File SQL otomatis dibuat dan tercatat versinya di `backend/drizzle/`)*
2. Terapkan migrasi ke database:
   ```bash
   pnpm db:migrate
   ```
3. Commit folder `backend/drizzle/` ke Git repository.
