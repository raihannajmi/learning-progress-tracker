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
4. Catat Connection String internal yang diberikan oleh Easypanel (contoh: `postgres://postgres:password@postgres-db:5432/learning_tracker?sslmode=disable`).

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
| `DATABASE_URL` | `postgres://postgres:pass@postgres-db:5432/learning_tracker?sslmode=disable` | URL koneksi ke service Postgres Easypanel |
| `JWT_SECRET` | `generate-random-secret-key-32-chars-minimum` | Kunci enkripsi token login |
| `GOOGLE_CLIENT_ID` | `your-id.apps.googleusercontent.com` | Google OAuth Web Client ID |
| `CLIENT_URL` | `https://learningtracker.netlify.app` | URL domain Frontend Anda di Netlify (untuk CORS) |

4. **Port Mapping / Domain:**
   - Tambahkan domain/subdomain di tab *Domains* (contoh: `api.domainanda.com` $\rightarrow$ port `5001`).

---

## 3. Cara Memasukkan Mahasiswa (Import JSON / CSV)

Ada **2 cara mudah dan fleksibel** untuk memasukkan file `students.private.json` ke production:

### Cara 1: Lewat Web UI Admin Panel (Paling Cepat & Praktis ⭐)
1. Login ke website Anda dengan Google menggunakan email Dosen/Admin (`najmiraihanworks@gmail.com`).
2. Masuk ke menu **Kelola Mahasiswa** (`/admin-students`).
3. Klik tombol **[Impor Batch CSV]**.
4. Klik tombol **[Pilih File (.json / .csv)]** dan pilih file `students.private.json` Anda, **ATAU** langsung *copy-paste* teks JSON array berikut:
   ```json
   [
     {"email": "muhammadzahi006@students.unnes.ac.id", "name": "Muhammad Zahi Ustadzi", "nim": "250414006", "className": "Rabu, Jam 10 DC 3A"},
     {"email": "yunamikanda06@students.unnes.ac.id", "name": "Yun Sabarina Mikanda", "nim": "2404140001", "className": "Kamis, Jam 7 D1 327"}
   ]
   ```
5. Modal akan otomatis mendeteksi format **JSON Array** dan otomatis mencocokkan tiap mahasiswa ke kelas yang sesuai berdasarkan `className`!
6. Klik **[Proses Impor Mahasiswa]** $\rightarrow$ Semua mahasiswa langsung aktif terdaftar di PostgreSQL!

---

### Cara 2: Lewat Terminal Easypanel (CLI Import)
1. Di Easypanel, buka service **Backend App** $\rightarrow$ Tab **Console / Terminal**.
2. Jalankan perintah migrasi & import langsung:
   ```bash
   node dist/db/seed-students.js
   ```
   *(Atau `pnpm db:import:students:prod`)*

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
| `VITE_API_URL` | `https://api.domainanda.com/api/v1` *(URL backend Easypanel Anda)* |
| `VITE_GOOGLE_CLIENT_ID` | `your-id.apps.googleusercontent.com` |

4. Klik **Deploy site**.
5. Netlify akan otomatis membaca [`netlify.toml`](file:///Users/najmiraihan/Developer/learning-progress-tracker/frontend/netlify.toml) yang telah dikonfigurasi dengan SPA redirect `/* -> /index.html`.

> [!TIP]
> **Keamanan UI Login di Production:**  
> Komponen simulasi akun demo (Dev Mode) telah diproteksi dengan `import.meta.env.DEV`. Saat dibuild dan di-deploy ke Netlify, kotak simulasi demo **otomatis hilang total**, sehingga mahasiswa hanya melihat tombol resmi **"Sign in with Google"**!
