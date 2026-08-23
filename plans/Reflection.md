Nah, ini baru bisa kita bikin checklist yang benar-benar nyambung ke RPS, bukan checklist “belajar HTML, CSS, JS” yang terlalu generik.

Tapi gue mau kritik dulu: RPS lu cukup ambisius untuk 8 pertemuan × 2 jam. Kalau targetnya mahasiswa benar-benar siap membuat fullstack mini-app di P8, kita nggak boleh menjadikan semua topik di RPS sebagai kompetensi yang harus dikuasai mendalam.

Learning Tracker sebaiknya punya konsep:

Minimum Skill Checklist

Artinya: “Apa saja yang minimal harus bisa dilakukan mahasiswa supaya minggu depan tidak benar-benar buta dan akhirnya bisa mengerjakan project?”

Bukan:

“Apakah mahasiswa sudah menguasai seluruh HTML/CSS/JavaScript?”

⸻

Learning Progress Checklist — Fullstack Web Development

Prinsip Checklist

Setiap skill memiliki 4 status:

○ Not Started
◐ Learning
◑ Practicing
● Can Do Independently

Dan setiap skill memiliki minimum evidence.

Contoh:

CSS Flexbox → Can Do Independently

Bukan berarti mahasiswa harus menguasai seluruh Flexbox.

Minimum evidence-nya:

“Saya bisa membuat layout navbar/card sederhana menggunakan Flexbox tanpa mengikuti tutorial langkah demi langkah.”

Ini jauh lebih realistis.

⸻

ROADMAP 8 MINGGU

WEEK 1
HTML + CSS Fundamentals
        ↓
WEEK 2
JavaScript + DOM
        ↓
WEEK 3
Backend + REST API
        ↓
WEEK 4
Database + CRUD
        ↓
WEEK 5
Frontend + API Integration
        ↓
WEEK 6
Authentication + Fullstack Integration
        ↓
WEEK 7
Third-party API + Real-world Integration
        ↓
WEEK 8
Debugging + Deployment + Fullstack Checkpoint

⸻

WEEK 1 — HTML + CSS

Learning Goal

Bisa membuat halaman web yang terstruktur, rapi, responsive, dan bisa menjadi dasar untuk project nyata.

⸻

A. Web Fundamentals

Understand

* Memahami browser, client, dan server secara sederhana
* Memahami URL
* Memahami HTTP secara konsep
* Memahami request dan response
* Memahami HTML, CSS, dan JavaScript memiliki fungsi berbeda

Minimum: mahasiswa bisa menjelaskan:

HTML untuk struktur, CSS untuk tampilan, JavaScript untuk behavior.

⸻

B. HTML Fundamentals

Structure

* <!DOCTYPE html>
* <html>
* <head>
* <body>
* <title>
* Semantic HTML

Content

* Heading (h1–h3)
* Paragraph
* Link
* Image
* List
* Table

Forms

* form
* input
* textarea
* select
* button
* label

Semantic Elements

* header
* nav
* main
* section
* article
* footer

Minimum Challenge

Buat halaman profile/product sederhana menggunakan semantic HTML, image, link, list, table, dan form.

⸻

C. CSS Fundamentals

Basic CSS

* Selector
* Class
* ID
* Cascade
* Specificity dasar
* Inline/internal/external CSS

Box Model

* width
* height
* margin
* padding
* border
* box-sizing

Typography

* font-family
* font-size
* font-weight
* line-height
* text-align

Color & Background

* color
* background
* border-radius
* Basic shadow

⸻

D. CSS Layout

Ini wajib karena banyak mahasiswa biasanya berhenti di:

“Saya sudah bisa bikin h1 warna merah.”

Padahal nanti project membutuhkan layout.

* display
* Flexbox
* justify-content
* align-items
* gap
* flex-direction
* Basic Grid
* Positioning dasar

Minimum Challenge

Buat navbar + hero + 3 card + footer menggunakan Flexbox/Grid.

⸻

E. Responsive Design

Ini juga wajib, jangan dijadikan materi tambahan.

* Memahami responsive design
* Relative unit (%, rem, vh, vw)
* Media query
* Mobile layout
* Desktop layout
* Menggunakan browser DevTools untuk mengecek ukuran layar

Minimum Challenge

Halaman yang dibuat pada challenge sebelumnya harus tetap usable pada mobile.

⸻

WEEK 1 — Definition of Done

Mahasiswa belum perlu menjadi “CSS expert”.

Mereka dianggap mencapai minimum jika:

* Bisa membuat struktur HTML sendiri
* Bisa menggunakan semantic HTML
* Bisa membuat form
* Memahami CSS box model
* Bisa membuat layout dengan Flexbox
* Memahami penggunaan Grid dasar
* Bisa membuat responsive layout
* Bisa membuat satu halaman dari desain/referensi tanpa mengikuti tutorial step-by-step

25-Minute Sprint Ideas

Sprint 1 → HTML structure
Sprint 2 → Semantic HTML
Sprint 3 → CSS Box Model
Sprint 4 → Flexbox
Sprint 5 → Grid
Sprint 6 → Responsive
Sprint 7 → Build landing page

⸻

WEEK 2 — JAVASCRIPT + DOM

Learning Goal

Bisa membuat halaman web yang memiliki behavior/interactivity.

⸻

A. JavaScript Fundamentals

* let
* const
* Primitive data types
* String
* Number
* Boolean
* Array
* Object
* Operator
* Conditional
* Loop

⸻

B. Function

* Membuat function
* Parameter
* Return value
* Arrow function

⸻

C. Array & Object

* Membaca object
* Mengubah object
* Array of objects
* map
* filter
* find
* forEach

Tidak perlu mengejar seluruh JavaScript API.

Yang penting mahasiswa mulai terbiasa dengan data.

⸻

D. DOM

* querySelector
* querySelectorAll
* Mengubah text
* Mengubah class
* Mengubah attribute
* Membuat element
* Menghapus element

⸻

E. Event

* click
* submit
* input
* change

⸻

F. Form Handling

* Mengambil value input
* Validasi sederhana
* Menampilkan error
* Menampilkan success state

⸻

G. Async JavaScript

Ini sangat penting untuk masuk ke fullstack.

* Memahami asynchronous operation
* Promise secara konsep
* async
* await
* try/catch
* fetch

⸻

WEEK 2 — Definition of Done

Mahasiswa minimal bisa:

* Membuat function
* Mengolah array/object
* Memanipulasi DOM
* Menangani event
* Membuat validasi form
* Mengambil data menggunakan fetch
* Menangani loading/error sederhana

Minimum Challenge

Buat todo app sederhana menggunakan HTML + CSS + JavaScript.

Tidak perlu database.

Data boleh disimpan sementara di memory/localStorage.

⸻

WEEK 3 — BACKEND + REST API

Learning Goal

Mahasiswa memahami bagaimana frontend berkomunikasi dengan backend.

⸻

A. Backend Fundamentals

* Apa itu backend
* Apa itu server
* Request
* Response
* Port
* Environment variable

⸻

B. Node.js

* Menjalankan Node.js
* npm
* package.json
* Install dependency
* Menjalankan development server

⸻

C. Express

* Membuat Express server
* Routing
* Middleware
* Request
* Response

⸻

D. HTTP Method

* GET
* POST
* PUT/PATCH
* DELETE

Mahasiswa harus memahami hubungan:

GET    → mengambil data
POST   → membuat data
PUT    → mengubah data
DELETE → menghapus data

⸻

E. REST API

* Endpoint
* Resource
* URL parameter
* Query parameter
* Request body
* JSON response
* HTTP status code

Minimum:

GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id

⸻

WEEK 3 — Definition of Done

Mahasiswa bisa:

* Membuat backend sederhana
* Membuat REST endpoint
* Menerima request
* Mengirim JSON response
* Menggunakan HTTP methods
* Menggunakan status code dasar
* Menguji API menggunakan Postman/Thunder Client

Minimum Challenge

Buat REST API sederhana untuk products.

⸻

WEEK 4 — DATABASE + CRUD

Learning Goal

Mahasiswa mampu menyimpan dan mengelola data secara persistent.

⸻

A. Database Fundamentals

* Apa itu database
* Table
* Row
* Column
* Primary key
* Foreign key

⸻

B. Relational Database

* Membuat table
* Data types
* Relationship
* One-to-many
* Basic normalization concept

⸻

C. SQL

* SELECT
* INSERT
* UPDATE
* DELETE
* WHERE
* ORDER BY
* LIMIT
* JOIN

Tidak perlu mengejar SQL advanced.

⸻

D. Backend + Database

* Connect backend → database
* Query data
* Create data
* Read data
* Update data
* Delete data
* Error handling

⸻

E. Validation

* Required field
* Type validation
* Basic business validation
* Error response

⸻

F. API Documentation

* Memahami API documentation
* Membuat collection Postman / dokumentasi endpoint
* Menjelaskan request & response

⸻

WEEK 4 — Definition of Done

Mahasiswa bisa membuat:

Database
   ↓
Backend
   ↓
REST API
   ↓
CRUD

Minimum challenge:

Buat API CRUD products atau tasks menggunakan database sungguhan.

⸻

WEEK 5 — FRONTEND + API

Learning Goal

Mahasiswa bisa menghubungkan frontend dengan backend.

⸻

A. Component-Based UI

Jika menggunakan React/Next.js:

* Component
* Props
* State
* Event handling
* Conditional rendering
* List rendering

⸻

B. Frontend Routing

* Page
* Route
* Dynamic route dasar

⸻

C. API Consumption

* GET API
* POST API
* PATCH API
* DELETE API

⸻

D. UI State

* Loading state
* Empty state
* Error state
* Success feedback

Ini penting banget untuk project client.

⸻

E. CRUD Interface

Mahasiswa harus bisa membuat:

List
 ↓
Create
 ↓
Read
 ↓
Update
 ↓
Delete

⸻

WEEK 5 — Definition of Done

Mahasiswa mampu membuat:

Frontend
    ↓
HTTP Request
    ↓
Backend API
    ↓
Database
    ↓
Response
    ↓
Frontend

Minimum challenge:

Bangun frontend CRUD yang mengonsumsi API pada minggu sebelumnya.

⸻

WEEK 6 — AUTHENTICATION + FULLSTACK

Learning Goal

Mahasiswa memahami konsep user dan akses terhadap aplikasi.

⸻

A. Authentication

* Apa itu authentication
* Register
* Login
* Logout
* Password
* Session/token secara konsep

⸻

B. Authorization

* Authentication vs authorization
* User role
* Protected route
* Protected API

⸻

C. Fullstack Integration

* Login frontend → backend
* Menyimpan session/token sesuai stack
* Mengirim credential/authentication
* Backend memvalidasi user
* Membatasi akses data

⸻

D. Basic Security Awareness

Tidak perlu menjadi security engineer.

Mahasiswa minimal memahami:

* Jangan menyimpan password plaintext
* Jangan menyimpan secret di frontend
* Environment variable
* Basic CORS concept
* Basic input validation

⸻

WEEK 6 — Definition of Done

Mahasiswa dapat membuat:

Register
   ↓
Login
   ↓
Authenticated User
   ↓
Protected API
   ↓
CRUD

Minimum challenge:

User dapat login dan hanya dapat mengakses data yang memang boleh dia akses.

⸻

WEEK 7 — THIRD-PARTY API

Ini bagian yang menurut gue jangan dibuat terlalu luas.

RPS lu menulis:

payment gateway/OAuth/cloud storage/DB as a service

Kalau semua diajarkan, nggak akan kejar.

Checklist sebaiknya fokus ke konsep integrasi API.

⸻

A. Third-party API Concept

* Memahami apa itu third-party API
* Membaca API documentation
* Authentication API
* API key
* Request
* Response
* Error handling

⸻

B. Integration

* Membaca dokumentasi API
* Membuat request
* Mengirim parameter
* Membaca response
* Menangani error
* Menyimpan secret dengan aman

⸻

C. Practical Integration

Pilih satu, jangan semua:

* Public API
* OAuth
* Cloud storage
* Payment sandbox
* Maps API

⸻

WEEK 7 — Definition of Done

Mahasiswa mampu mengatakan:

“Saya bisa membaca dokumentasi API dan mengintegrasikan service eksternal ke aplikasi saya.”

Tidak perlu:

“Saya menguasai payment gateway.”

⸻

WEEK 8 — DEBUGGING + DEPLOYMENT

Ini menurut gue justru harus diberi porsi besar.

Karena tujuan akhir lu bukan:

mahasiswa bisa mengikuti tutorial.

Tapi:

mahasiswa bisa menyelesaikan masalah client.

⸻

A. Debugging

* Membaca error message
* Browser DevTools
* Console
* Network tab
* HTTP status code
* Backend logs
* Database error
* Isolasi masalah
* Membuat hypothesis
* Testing hypothesis

⸻

B. Git

Kalau belum menjadi bagian workflow:

* Git init
* Commit
* Push
* Pull
* Branch dasar
* Pull request secara konsep

Tidak perlu mengajarkan Git secara mendalam.

⸻

C. Deployment

* Build application
* Environment variables
* Production database
* Deploy frontend
* Deploy backend
* Domain/URL
* CORS production
* Basic production debugging

⸻

D. Production Readiness

* Application dapat diakses melalui internet
* Database production terhubung
* Authentication bekerja
* CRUD bekerja
* Tidak ada secret di repository
* Basic error handling tersedia

⸻

WEEK 8 — Definition of Done

Mahasiswa mampu:

mengambil aplikasi fullstack sederhana → menemukan masalah → memperbaikinya → deploy → memberikan URL yang bisa digunakan.

Ini checkpoint paling penting sebelum masuk project mandiri.

⸻

FINAL MINIMUM SKILL CHECKLIST

Nah, ini yang menurut gue paling penting untuk ditampilkan di Learning Progress Tracker.

Jangan tampilkan 150 checklist sekaligus.

Mahasiswa melihat:

“Can I Build This?”

HTML/CSS

* Build semantic HTML page
* Create forms
* Style using CSS
* Use Flexbox
* Use basic Grid
* Create responsive layout

JavaScript

* Use variables/functions
* Manipulate arrays/objects
* Manipulate DOM
* Handle events
* Validate forms
* Fetch API

Backend

* Create server
* Create REST API
* Handle HTTP methods
* Handle request/response
* Handle errors

Database

* Design basic relational database
* Create tables
* Write basic SQL
* Connect database to backend
* Implement CRUD

Frontend

* Create components
* Manage state
* Consume API
* Create CRUD UI
* Handle loading/error/empty states

Authentication

* Implement login
* Implement logout
* Protect routes
* Protect API
* Understand authorization

Integration

* Read third-party API documentation
* Call third-party API
* Handle API errors
* Protect API secrets

Deployment

* Use environment variables
* Build application
* Deploy application
* Connect production database
* Debug production issue

⸻

Yang Gue Akan Ubah dari Konsep Awal Kita

Ada satu hal penting: jangan bikin mahasiswa mengejar semua checklist dengan bobot yang sama.

Saya akan membagi menjadi tiga level:

MUST KNOW

Tanpa ini, mereka akan kesulitan mengerjakan project.

Contoh:

HTML
CSS
Flexbox
Responsive
JavaScript basic
DOM
fetch
REST API
CRUD
Database
Frontend API integration
Authentication
Deployment

SHOULD KNOW

Bagus kalau mereka kuasai, tetapi tidak menghambat project kalau belum sempurna.

CSS Grid advanced
Array methods lebih banyak
Advanced SQL
Advanced state management
Git branching
API documentation

NICE TO KNOW

Tidak perlu dikejar dalam 8 minggu.

Advanced CSS animation
Advanced JavaScript
Complex architecture
Advanced SQL optimization
Advanced authentication
Microservices
Docker
CI/CD
Advanced testing

⸻

Dan Ini yang Paling Penting untuk Tracker

Saya tidak akan membuat checklist berdasarkan “materi yang sudah diajarkan” saja.

Saya akan membuat dua lapisan:

                    LEARNING ROADMAP
                           │
          ┌────────────────┴────────────────┐
          ↓                                 ↓
    KNOWLEDGE CHECKLIST              PRACTICAL CHECK
          │                                 │
    "Saya paham..."                  "Saya bisa membuat..."
          │                                 │
          └────────────────┬────────────────┘
                           ↓
                    SELF ASSESSMENT
                           ↓
                    LEARNING SPRINT
                           ↓
                       EVIDENCE
                           ↓
                    PEER FEEDBACK

Karena ada mahasiswa yang bisa mencentang:

“Saya paham Flexbox.”

tetapi ketika disuruh:

“Bikin navbar responsive.”

langsung bingung.

Yang kita kejar sebenarnya bukan checklist yang penuh. Yang kita kejar adalah kemampuan praktis minimum.

Dan ini juga membuat 25 Minute Learning Sprint lu masuk akal: setiap minggu mereka tidak cuma “belajar 25 menit”, tapi 25 menit itu diarahkan ke satu skill yang konkret, lalu mereka meninggalkan evidence/reflection.

Jadi nanti di website, mahasiswa bisa melihat misalnya:

This Week: Responsive Web

4 / 7 skills self-assessed

Your next skill: CSS Media Query

25 Minute Sprint

Challenge: Make your previous page usable on mobile.

After learning: Tell us what you learned + show your evidence.

Itu menurut gue jauh lebih kuat daripada sekadar dashboard HTML 80%, CSS 70%, JS 20%.