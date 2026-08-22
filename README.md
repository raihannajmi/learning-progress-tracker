# Learning Progress Tracker

A lightweight, high-performance learning progress and peer accountability web application for ~90 web development students and Teaching Assistants / Lecturers (Admins).

## Core Philosophy
- **Progress, Bukan Grading**: Tidak ada nilai angka akademik atau gradebook.
- **Self-Assessment**: Mahasiswa menandai pemahaman mandiri melalui 4 tahap (`NOT_STARTED` ○, `LEARNING` ◐, `PRACTICING` ◐, `CAN_DO_INDEPENDENTLY` ✓).
- **25-Minute Learning Sprint**: Membangun kebiasaan belajar minimal 25 menit dengan catatan refleksi dan evidence (GitHub / Loom / Figma).
- **Peer Feedback**: Saling memberikan feedback kualitatif dan konstruktif antar teman sekelas.
- **TA Monitoring**: Asisten dosen dapat melihat pola kebingungan kelas dan mahasiswa yang pasif tanpa harus memeriksa 90 mahasiswa secara manual.

---

## Tech Stack

- **Backend**: Node.js + Express.js (v5) + TypeScript + Drizzle ORM + PostgreSQL (Docker) + Zod + Google Auth Library + JWT.
- **Frontend**: Vite + React 19 + TanStack Router (file-based) + TanStack Query + Zustand + Formik + Yup + Tailwind CSS + Lucide Icons.

---

## Quick Start Guide

### 1. Jalankan Database PostgreSQL (Docker)
```bash
docker compose up -d
```
> Database berjalan di `localhost:5434` dengan nama database `learning_progress_tracker`.

### 2. Jalankan Backend (Express + Drizzle)
```bash
cd backend
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```
> Backend berjalan di `http://localhost:5001`.

### 3. Jalankan Frontend (TanStack Router + React)
```bash
cd frontend
pnpm install
pnpm dev
```
> Frontend berjalan di `http://localhost:3000`.

---

## Akun Demo Whitelist (Instant Dev-Mock Login)

Di halaman login (`/`), tersedia tombol instan untuk login sebagai:
- **Dosen Pengampu** (`dosen@univ.ac.id`) — Role: `ADMIN`
- **Asisten Dosen** (`ta@univ.ac.id`) — Role: `ADMIN`
- **Andi Pratama** (`andi@student.univ.ac.id`) — Role: `STUDENT` (Kelas A)
- **Citra Lestari** (`citra@student.univ.ac.id`) — Role: `STUDENT` (Kelas B)

---

## Testing & Verification
Untuk menjalankan suite pengujian otomatis backend:
```bash
cd backend
pnpm tsx src/test-api.ts
```
