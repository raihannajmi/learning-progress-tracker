# 📚 Silabus & Roadmap Pembelajaran: Web Development (8 Pekan)

Kurikulum berorientasi praktek (*Outcome-Based Learning*) dengan target kebiasaan fokus harian ($\ge 25$ menit) dan validasi kompetensi mandiri.

---

## 📌 Pekan 1: HTML & CSS Fundamentals
> **Tujuan**: Membuat halaman web yang terstruktur semantik, rapi, responsif, dan menjadi fondasi project nyata.

### 🔹 Topik 1: Web Fundamentals & Semantic HTML (`HTML`)
- [ ] Saya memahami peran browser, client, server, HTTP request/response, dan fungsi HTML vs CSS vs JS
- [ ] Saya dapat menyusun struktur HTML5 semantik (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- [ ] Saya bisa membuat form lengkap (`input`, `textarea`, `select`, `label`, `button`) dan halaman profil/produk terstruktur

### 🔹 Topik 2: CSS Selectors, Box Model & Styling (`CSS`)
- [ ] Saya memahami selector hierarchy, class, ID, cascade, dan specificity CSS dasar
- [ ] Saya memahami cara kerja box model (*content*, *padding*, *border*, *margin*) dan konsisten memakai `box-sizing: border-box`
- [ ] Saya dapat mengatur typography, color, border-radius, dan subtle shadow secara rapi

### 🔹 Topik 3: CSS Layout (Flexbox & Grid) (`CSS`)
- [ ] Saya memahami flex container vs items (`justify-content`, `align-items`, `gap`, `flex-direction`)
- [ ] Saya memahami CSS Grid dasar (`grid-template-columns`, `gap`, `repeat(auto-fit, minmax(...))`)
- [ ] **🎯 Minimum Challenge**: Saya bisa membuat layout navbar + hero + 3 card + footer tanpa tutorial step-by-step

### 🔹 Topik 4: Responsive Design & Media Queries (`CSS`)
- [ ] Saya memahami relative units (`%`, `rem`, `vh`, `vw`) dan DevTools responsive viewport inspection
- [ ] **🎯 Minimum Challenge**: Saya bisa menulis media queries agar seluruh halaman tetap rapi dan usable di layar mobile

---

## 📌 Pekan 2: JavaScript & DOM Interaction
> **Tujuan**: Membangun antarmuka web dinamis yang memiliki behavior, pengolahan data, dan interaktivitas event.

### 🔹 Topik 1: JavaScript Core & Array/Object Data (`JAVASCRIPT`)
- [ ] Saya memahami `let`/`const`, tipe data primitif vs reference, template literals, dan ternary operator
- [ ] Saya memahami function declaration, arrow function, dan scope (*block* vs *function scope*)
- [ ] Saya mahir memanipulasi array of objects menggunakan `map`, `filter`, `find`, `reduce`, `includes`

### 🔹 Topik 2: DOM Manipulation & Event Handling (`JAVASCRIPT`)
- [ ] Saya bisa memilih elemen DOM dengan `querySelector`/`querySelectorAll` dan mengubah text/HTML/class secara dinamis
- [ ] Saya bisa menangani event listener (`click`, `input`, `submit`) dan mencegah reload default form (`e.preventDefault()`)
- [ ] **🎯 Minimum Challenge**: Saya bisa membuat aplikasi Todo / Filterable Card List yang render secara dinamis dari array state

### 🔹 Topik 3: Browser Storage & State Persistence (`JAVASCRIPT`)
- [ ] Saya memahami cara menyimpan dan membaca data JSON dengan `localStorage` / `sessionStorage`

---

## 📌 Pekan 3: Asynchronous JS, Fetch API & Git Collaboration
> **Tujuan**: Mengintegrasikan data eksternal via API publik dan menerapkan alur kolaborasi version control standar industri.

### 🔹 Topik 1: Async/Await & REST API Integration (`JAVASCRIPT`)
- [ ] Saya memahami konsep Asynchronous, Promise, dan sintaks `async`/`await`
- [ ] Saya bisa melakukan HTTP fetch (`GET`, `POST`) ke public REST API dan parsing response JSON
- [ ] Saya bisa mengimplementasikan 3 state UI penting: *Loading Skeleton*, *Success Render*, dan *Error Alert*
- [ ] **🎯 Minimum Challenge**: Saya bisa membuat Mini App (Weather / Movie / GitHub Explorer) yang mengambil data nyata via API

### 🔹 Topik 2: Git Version Control & Deployment (`FULLSTACK`)
- [ ] Saya menguasai perintah `git init`, `add`, `commit`, `branch`, `merge`, dan menyelesaikan merge conflict
- [ ] Saya bisa push project ke GitHub dan melakukan live deployment via GitHub Pages, Vercel, atau Netlify

---

## 📌 Pekan 4: Modern Frontend with React & State Management
> **Tujuan**: Membangun Single Page Application (SPA) berbasis komponen modular dengan React, Hooks, dan typed props.

### 🔹 Topik 1: React Fundamentals & Component Architecture (`JAVASCRIPT`)
- [ ] Saya memahami JSX, Virtual DOM, unidirectional data flow, dan pemecahan UI ke komponen reusable
- [ ] Saya memahami pemisahan props vs state dan passing callback handler ke child component

### 🔹 Topik 2: React Hooks & Side Effects (`JAVASCRIPT`)
- [ ] Saya menguasai `useState` untuk mengelola input form dan array daftar dinamis
- [ ] Saya menguasai `useEffect` untuk fetch data saat mount dan memahami dependency array
- [ ] **🎯 Minimum Challenge**: Saya bisa membuat Dynamic Interactive App dengan React tanpa error re-render infinite loop

---

## 📌 Pekan 5: Backend API Development with Node.js & Express
> **Tujuan**: Merancang RESTful API production-grade, routing modular, dan validasi skema request di sisi server.

### 🔹 Topik 1: Node.js Runtime & Express Server Setup (`BACKEND`)
- [ ] Saya memahami peran Node.js runtime, npm package management, dan arsitektur client-server
- [ ] Saya bisa membuat server Express dengan routing modular, middleware `express.json()`, dan konfigurasi CORS

### 🔹 Topik 2: RESTful API Design & Input Validation (`BACKEND`)
- [ ] Saya dapat merancang endpoint RESTful (`GET`, `POST`, `PUT`/`PATCH`, `DELETE`) dengan HTTP Status Code yang tepat (`200`, `201`, `400`, `404`, `500`)
- [ ] Saya mengimplementasikan middleware validasi skema request body menggunakan Zod / Joi
- [ ] **🎯 Minimum Challenge**: Saya bisa membuat CRUD API lengkap yang teruji via Postman / Bruno / ThunderClient

---

## 📌 Pekan 6: Relational Database with PostgreSQL & Drizzle ORM
> **Tujuan**: Pemodelan relasi database relasional, migrasi skema terstruktur, dan persistensi data SQL.

### 🔹 Topik 1: Database Design, Tables & Relational Modeling (`BACKEND`)
- [ ] Saya memahami konsep RDBMS, Primary Key, Foreign Key, dan relasi `1:N` serta `N:M`
- [ ] Saya bisa mendesain skema tabel normalisasi (`users`, `posts`, `categories`, `comments`)

### 🔹 Topik 2: PostgreSQL & Drizzle ORM Migration (`BACKEND`)
- [ ] Saya dapat menghubungkan Express ke PostgreSQL menggunakan Drizzle ORM / Prisma
- [ ] Saya bisa menjalankan database migration dan menulis query `SELECT`, `JOIN`, `INSERT`, `UPDATE`, `DELETE` via ORM
- [ ] **🎯 Minimum Challenge**: Seluruh data aplikasi CRUD tersimpan permanen di database PostgreSQL dengan relasi foreign key yang aman

---

## 📌 Pekan 7: Authentication, Security & Fullstack Integration
> **Tujuan**: Mengamankan API dengan JWT token, password hashing/OAuth, dan integrasi frontend ke backend terproteksi.

### 🔹 Topik 1: Authentication & Authorization (JWT / OAuth) (`BACKEND`)
- [ ] Saya memahami perbedaan Authentication (identitas pengguna) vs Authorization (role & hak akses)
- [ ] Saya bisa mengimplementasikan login/register aman dengan bcrypt password hashing atau Google OAuth 2.0
- [ ] Saya bisa membuat Auth Middleware yang memverifikasi JWT Bearer token pada route privat

### 🔹 Topik 2: Fullstack Client-Server Connection (`FULLSTACK`)
- [ ] Saya bisa menghubungkan Frontend React ke Backend API milik sendiri dengan header `Authorization: Bearer <token>`
- [ ] Saya bisa menangani protected routing di frontend (redirect ke login jika belum authenticated)
- [ ] **🎯 Minimum Challenge**: Alur Auth lengkap dari frontend ke backend bekerja mulus dengan user session yang tersimpan aman

---

## 📌 Pekan 8: Production Deployment & Capstone Project
> **Tujuan**: Peluncuran aplikasi fullstack utuh ke lingkungan production live cloud dengan database hosting.

### 🔹 Topik 1: Environment Variables & Production Security (`FULLSTACK`)
- [ ] Saya memahami manajemen `.env`, pemisahan credential rahasia dari git commit, dan konfigurasi CORS production
- [ ] Saya mengerti cara penanganan error global tanpa mengekspos stack trace sensitif ke client

### 🔹 Topik 2: Cloud Deployment & Live Showcase (`FULLSTACK`)
- [ ] Saya bisa men-deploy database PostgreSQL ke cloud (Supabase / Neon / Render)
- [ ] Saya bisa men-deploy Backend Express ke cloud platform (Render / Railway / Fly.io / VPS)
- [ ] Saya bisa men-deploy Frontend ke Netlify / Vercel dan menghubungkannya ke live backend URL
- [ ] **🎯 Minimum Challenge**: Aplikasi Fullstack utuh live di internet, dapat diakses publik, dan siap dipresentasikan di depan kelas/klien
