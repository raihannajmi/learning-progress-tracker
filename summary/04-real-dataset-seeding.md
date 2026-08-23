# Summary 04: Class & Student Whitelist Dataset Architecture

**Date:** 2026-08-22  
**Status:** Completed & Database Seeded  
**Reference:** [database.md](file:///Users/najmiraihan/Developer/learning-progress-tracker/database.md)

---

## 1. Seed Architecture & Privacy Separation

- **Primary Admin / Lecturer:**
  - Name: `Alif Najmi Raihan Putra Hidayat`
  - Email: `najmiraihanworks@gmail.com`
  - Role: `ADMIN`
- **Academic Classes Seeded:**
  1. `Rabu, Jam 10 DC 3A` (Term: `2026/2027 Ganjil`)
  2. `Kamis, Jam 7 D1 327` (Term: `2026/2027 Ganjil`)
- **Student Privacy & Public Repo Protection:**
  - **Public Demo Dataset:** 30 synthetic demo students committed for public open-source repository usage.
  - **Private Real Dataset (`students.private.json`):** Git-ignored file for private class usage by the instructor.
- **Roadmap Syllabus:** 8 Weeks of Web Development Curriculum (HTML/CSS, JavaScript, React, Node/Express, PostgreSQL, Cloud Deployment).

---

## 2. Quick Test / Demo Logins (Dev Mode)

Di halaman login (`/`), telah disediakan tombol login instan untuk simulasi:
- **Alif Najmi Raihan (Admin)** (`najmiraihanworks@gmail.com`)
- **Budi Santoso (Mahasiswa Kelas Rabu)** (`student.01@demo.univ.ac.id`)
- **Yunita Sari (Mahasiswa Kelas Kamis)** (`student.16@demo.univ.ac.id`)
