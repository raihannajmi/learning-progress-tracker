Silabus & Roadmap Pembelajaran: Web Development (8 Pekan)

Pekan 1: HTML & CSS Fundamentals
Tujuan: Membuat halaman web yang terstruktur semantik, rapi, responsif, dan menjadi fondasi project nyata.
1. Topik: Web Fundamentals & Semantic HTML (HTML)
   - Saya memahami peran browser, client, server, HTTP request/response, dan fungsi HTML vs CSS vs JS
   - Saya dapat menyusun struktur HTML5 semantik (header, nav, main, section, article, footer)
   - Saya bisa membuat form lengkap (input, textarea, select, label, button) dan halaman profil/produk terstruktur
2. Topik: CSS Selectors, Box Model & Styling (CSS)
   - Saya memahami selector hierarchy, class, ID, cascade, dan specificity CSS dasar
   - Saya memahami cara kerja box model (content, padding, border, margin) dan konsisten memakai box-sizing: border-box
   - Saya dapat mengatur typography, color, border-radius, dan subtle shadow secara rapi
3. Topik: CSS Layout (Flexbox & Grid) (CSS)
   - Saya memahami flex container vs items (justify-content, align-items, gap, flex-direction)
   - Saya memahami CSS Grid dasar (grid-template-columns, gap, repeat auto-fit/minmax)
   - Minimum Challenge: Saya bisa membuat layout navbar + hero + 3 card + footer tanpa tutorial step-by-step
4. Topik: Responsive Design & Media Queries (CSS)
   - Saya memahami relative units (%, rem, vh, vw) dan DevTools responsive viewport inspection
   - Minimum Challenge: Saya bisa menulis media queries agar seluruh halaman tetap rapi dan usable di mobile

Pekan 2: JavaScript & DOM Interaction
Tujuan: Membangun antarmuka web dinamis yang memiliki behavior, pengolahan data, dan event interactivity.
1. Topik: JavaScript Core & Array/Object Data (JAVASCRIPT)
   - Saya memahami let/const, tipe data primitif vs reference, template literals, dan ternary operator
   - Saya memahami function declaration, arrow function, dan scope (block vs function scope)
   - Saya mahir memanipulasi array of objects menggunakan map, filter, find, reduce, includes
2. Topik: DOM Manipulation & Event Handling (JAVASCRIPT)
   - Saya bisa memilih elemen DOM dengan querySelector/querySelectorAll dan mengubah text/HTML/class secara dinamis
   - Saya bisa menangani event listener (click, input, submit) dan mencegah reload default form (preventDefault)
   - Minimum Challenge: Saya bisa membuat aplikasi Todo / Filterable Card List yang render secara dinamis dari array state
3. Topik: Browser Storage & State Persistence (JAVASCRIPT)
   - Saya memahami cara menyimpan dan membaca data JSON dengan localStorage / sessionStorage

Pekan 3: Asynchronous JS, Fetch API & Git Collaboration
Tujuan: Mengintegrasikan data eksternal via API dan alur kolaborasi version control standar industri.
1. Topik: Async/Await & REST API Integration (JAVASCRIPT)
   - Saya memahami konsep Asynchronous, Promise, dan sintaks async/await
   - Saya bisa melakukan HTTP fetch (GET, POST) ke public REST API dan parsing response JSON
   - Saya bisa mengimplementasikan 3 state UI penting: Loading State, Success Render, dan Error Handling Alert
   - Minimum Challenge: Saya bisa membuat Mini App (Weather / Movie / GitHub Explorer) yang fetch data real
2. Topik: Git Version Control & Deployment (FULLSTACK)
   - Saya menguasai perintah git init, add, commit, branch, merge, dan resolve merge conflict
   - Saya bisa push project ke GitHub dan melakukan live deployment via GitHub Pages, Vercel, atau Netlify

Pekan 4: Modern Frontend with React & State Management
Tujuan: Membangun Single Page Application komponen modular dengan React, Hooks, dan Typed props.
1. Topik: React Fundamentals & Component Architecture (JAVASCRIPT)
   - Saya memahami JSX, Virtual DOM, unidirectional data flow, dan pemecahan UI ke komponen reusable
   - Saya memahami pemisahan props vs state dan passing callback handler ke child component
2. Topik: React Hooks & Side Effects (JAVASCRIPT)
   - Saya menguasai useState untuk mengelola form input dan dynamic list array
   - Saya menguasai useEffect untuk fetch data saat mount dan memahami dependency array
   - Minimum Challenge: Saya bisa membuat Dynamic Interactive App dengan React tanpa error re-render infinite loop

Pekan 5: Backend API Development with Node.js & Express
Tujuan: Merancang RESTful API production-grade, routing modular, dan request validation di sisi server.
1. Topik: Node.js Runtime & Express Server Setup (BACKEND)
   - Saya memahami peran Node.js runtime, npm package management, dan arsitektur server client-backend
   - Saya bisa membuat server Express dengan routing modular, express.json() middleware, dan CORS configuration
2. Topik: RESTful API Design & Input Validation (BACKEND)
   - Saya dapat merancang endpoint RESTful (GET, POST, PUT/PATCH, DELETE) dengan HTTP Status Code yang tepat (200, 201, 400, 404, 500)
   - Saya mengimplementasikan middleware validasi skema request body menggunakan Zod / Joi
   - Minimum Challenge: Saya bisa membuat CRUD API lengkap yang teruji via Postman / Bruno / ThunderClient

Pekan 6: Relational Database with PostgreSQL & Drizzle ORM
Tujuan: Pemodelan relasi database relational, skema migration, dan agregasi data SQL.
1. Topik: Database Design, Tables & Relational Modeling (BACKEND)
   - Saya memahami konsep RDBMS, Primary Key, Foreign Key, dan relasi 1:N serta N:M
   - Saya bisa mendesain skema tabel normalisasi (users, posts, categories, comments)
2. Topik: PostgreSQL & Drizzle ORM Migration (BACKEND)
   - Saya dapat mengkoneksikan Express ke PostgreSQL menggunakan Drizzle ORM / Prisma
   - Saya bisa menjalankan database migration dan menulis query SELECT, JOIN, INSERT, UPDATE, DELETE via ORM
   - Minimum Challenge: Seluruh data aplikasi CRUD tersimpan permanen di database PostgreSQL dengan relasi foreign key

Pekan 7: Authentication, Security & Fullstack Integration
Tujuan: Mengamankan API dengan JWT, password hashing/OAuth, dan integrasi frontend ke backend terproteksi.
1. Topik: Authentication & Authorization (JWT / OAuth) (BACKEND)
   - Saya memahami perbedaan Authentication (siapa Anda) vs Authorization (role & izin akses)
   - Saya bisa mengimplementasikan login/register aman dengan bcrypt password hashing atau Google OAuth 2.0
   - Saya bisa membuat Auth Middleware yang memverifikasi JWT Bearer token pada route privat
2. Topik: Fullstack Client-Server Connection (FULLSTACK)
   - Saya bisa menghubungkan Frontend React ke Backend API milik sendiri dengan Bearer Token authorization header
   - Saya bisa menangani protected routing di frontend (redirect ke login jika belum authenticated)
   - Minimum Challenge: Alur Auth lengkap dari frontend ke backend bekerja mulus dengan user session tersimpan

Pekan 8: Production Deployment & Capstone Project
Tujuan: Peluncuran produk fullstack ke lingkungan production live cloud dengan database hosting.
1. Topik: Environment Variables & Production Security (FULLSTACK)
   - Saya memahami manajemen .env, pemisahan credential rahasia dari git commit, dan konfigurasi CORS production
   - Saya mengerti cara penanganan error global tanpa mengekspos stack trace sensitif ke client
2. Topik: Cloud Deployment & Live Showcase (FULLSTACK)
   - Saya bisa men-deploy database PostgreSQL ke cloud (Supabase / Neon / Render)
   - Saya bisa men-deploy Backend Express ke cloud platform (Render / Railway / Fly.io / VPS)
   - Saya bisa men-deploy Frontend ke Netlify / Vercel dan menghubungkannya ke live backend URL
   - Minimum Challenge: Aplikasi Fullstack utuh live di internet, dapat diakses publik, dan siap dipresentasikan
