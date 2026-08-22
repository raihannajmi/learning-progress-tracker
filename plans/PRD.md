PRD — Learning Progress Tracker

Status: Draft — Ready for Implementation
Version: 1.0
Product Type: Learning Progress & Peer Accountability Tool

⸻

1. Product Overview

Learning Progress Tracker adalah aplikasi sederhana untuk membantu mahasiswa memantau proses belajar web development selama perkuliahan.

Sistem ini dibuat untuk membantu sekitar 90 mahasiswa dari 2 kelas agar:

* mengetahui apa yang perlu dipelajari;
* memiliki kebiasaan belajar mandiri minimal 25 menit;
* mencatat apa yang mereka pelajari;
* melakukan self-assessment;
* membagikan bukti/progress belajar;
* saling memberikan feedback;
* dan membantu asisten dosen melihat kondisi kelas tanpa harus memeriksa satu per satu melalui Google Form, Google Sheet, dan GitHub.

Sistem bukan LMS, bukan sistem penilaian akademik, dan bukan sistem competency assessment.

⸻

2. Problem Statement

Saat ini proses monitoring pembelajaran dilakukan menggunakan kombinasi:

* Google Form untuk pengumpulan;
* Google Sheets untuk monitoring;
* GitHub untuk melihat hasil pekerjaan mahasiswa;
* referensi pembelajaran eksternal seperti freeCodeCamp.

Pendekatan tersebut memiliki beberapa masalah:

2.1 Monitoring terlalu manual

Asisten dosen harus berpindah-pindah antara:

Google Form
    ↓
Google Sheets
    ↓
GitHub
    ↓
GitHub Pages

Hal ini sulit dilakukan secara konsisten untuk sekitar 90 mahasiswa.

2.2 Google Form hanya menangkap submission

Google Form dapat menjawab:

“Siapa yang mengumpulkan?”

Tetapi kurang mampu menjawab:

“Mahasiswa ini sekarang sedang belajar apa?”

“Apa yang menurut mereka sudah mereka pahami?”

“Bagian mana yang masih membingungkan?”

“Apakah mereka benar-benar melakukan proses belajar secara konsisten?”

2.3 GitHub bukan indikator pembelajaran yang cukup

GitHub berguna sebagai evidence pekerjaan, tetapi aktivitas GitHub tidak selalu menunjukkan:

* pemahaman konsep;
* proses belajar;
* kesulitan mahasiswa;
* apa yang sedang dipelajari;
* atau apa yang sebenarnya mereka butuhkan.

Karena itu GitHub hanya menjadi supporting evidence, bukan sumber utama progress.

2.4 Materi yang harus dikuasai cukup banyak

Dalam fase awal perkuliahan, mahasiswa harus mengejar kemampuan dasar hingga fullstack dalam waktu terbatas.

Contoh roadmap:

HTML
 ↓
CSS
 ↓
Responsive Design
 ↓
JavaScript
 ↓
Frontend
 ↓
Backend
 ↓
Database
 ↓
Fullstack

Mahasiswa membutuhkan gambaran yang jelas tentang:

“Saya harus belajar apa selanjutnya?”

⸻

3. Product Goal

Tujuan utama sistem:

Membantu mahasiswa bergerak secara konsisten dari pembelajaran dasar menuju kemampuan minimum yang diperlukan untuk menyelesaikan project client.

Sistem tidak bertujuan membuktikan bahwa mahasiswa “mahir”.

Sistem hanya membantu memastikan:

Tahu apa yang harus dipelajari
        ↓
Belajar
        ↓
Berlatih
        ↓
Merefleksikan pembelajaran
        ↓
Self-assessment
        ↓
Mendapat feedback
        ↓
Memperbaiki diri
        ↓
Siap mengerjakan project

⸻

4. Product Philosophy

4.1 Progress, bukan grading

Sistem tidak memberikan nilai akademik.

Tidak ada:

Score: 87
Grade: A
Competency: 92%

Yang ada adalah progress pembelajaran.

⸻

4.2 Self-assessment, bukan official assessment

Mahasiswa dapat menyatakan kondisi dirinya sendiri.

Contoh:

HTML Semantic
✓ Can Do Independently
CSS Flexbox
◐ Practicing
CSS Grid
◐ Learning
Responsive Design
○ Not Started

Status tersebut adalah pernyataan mahasiswa, bukan keputusan sistem bahwa mahasiswa benar-benar kompeten.

⸻

4.3 Evidence membantu, tetapi tidak menjadi nilai

Mahasiswa dapat menyertakan:

* GitHub;
* GitHub Pages;
* Loom;
* Figma;
* live website;
* atau URL lainnya.

Evidence digunakan untuk memberikan konteks terhadap progress.

⸻

4.4 Peer feedback sebagai support

Mahasiswa dapat melihat progress teman dan memberikan feedback.

Peer feedback tidak menjadi:

* nilai;
* score;
* ranking;
* indikator kompetensi.

Tujuannya:

membantu mahasiswa belajar dari mahasiswa lain.

⸻

5. Target Users

5.1 Student

Sekitar 90 mahasiswa dari 2 kelas.

Kebutuhan utama:

* mengetahui learning target;
* mencatat aktivitas belajar;
* self-assessment;
* melihat progress;
* berbagi evidence;
* mendapatkan feedback.

⸻

5.2 Teaching Assistant

Kebutuhan utama:

* melihat progress kelas;
* melihat aktivitas belajar;
* mengetahui topik yang sedang dipelajari;
* mengetahui bagian yang banyak membingungkan mahasiswa;
* melihat mahasiswa yang membutuhkan perhatian;
* tidak perlu memeriksa 90 mahasiswa satu per satu.

⸻

6. Product Scope

6.1 In Scope

Core

* Authentication.
* Student profile.
* Class management.
* Learning roadmap.
* Weekly learning target.
* Learning topics.
* Learning checklist.
* Learning Sprint.
* Reflection.
* Evidence URL.
* Self-assessment.
* Student dashboard.
* Class dashboard.
* Peer feedback.
* Teaching assistant dashboard.
* External learning resources.
* External milestone tracking.

⸻

6.2 Out of Scope

Sistem tidak mencakup:

* academic grading;
* UTS scoring;
* UAS scoring;
* gradebook;
* attendance;
* AI assessment;
* AI grading;
* AI-generated feedback;
* automated competency scoring;
* public ranking mahasiswa;
* leaderboard;
* full LMS;
* course-content management yang kompleks;
* forum/chat;
* project management kompleks;
* issue tracker;
* GitHub API integration untuk MVP;
* automated subjective code review.

⸻

7. Academic Context

Sistem digunakan sebagai pendamping proses pembelajaran.

Struktur pembelajaran:

8 Pertemuan Awal
        ↓
Pembelajaran Web Development
        ↓
Minimum Practical Skill
        ↓
8 Pertemuan Project Implementation
        ↓
Client Project

Target sistem adalah membantu mahasiswa mencapai minimum practical readiness sebelum masuk fase project.

⸻

8. External Academic Milestones

8.1 UTS

Mahasiswa memperoleh milestone eksternal melalui:

freeCodeCamp certificate

Sistem tidak menghitung nilai UTS.

Sistem hanya dapat mencatat:

Milestone:
Responsive Web Design
Status:
Completed
Certificate:
https://...

⸻

8.2 UAS

Mahasiswa mengerjakan project berdasarkan client/problem nyata.

Sistem dapat membantu memantau progress project, tetapi:

nilai UAS tidak dikelola oleh sistem.

⸻

9. Core Learning Model

9.1 Roadmap

Roadmap menjadi sumber utama informasi:

Apa yang harus dipelajari mahasiswa?

Contoh:

Week 1
HTML + CSS Fundamentals
HTML
├── Document Structure
├── Heading
├── Paragraph
├── Image
├── Link
├── List
├── Table
└── Form
CSS
├── Selector
├── Box Model
├── Typography
├── Color
└── Basic Layout

⸻

10. Learning Checklist

Setiap topic memiliki checklist.

Contoh:

CSS
✓ Saya memahami selector
✓ Saya memahami box model
✓ Saya dapat menggunakan margin dan padding
◐ Saya sedang mempelajari Flexbox
○ Saya belum mempelajari Grid
○ Saya belum mempelajari Responsive Design

Checklist merupakan self-assessment.

Sistem tidak menyatakan:

“Mahasiswa sudah kompeten.”

Sistem hanya menyimpan:

“Mahasiswa menyatakan dirinya berada pada tahap tersebut.”

⸻

11. Self-Assessment States

Status yang digunakan:

NOT_STARTED
LEARNING
PRACTICING
CAN_DO_INDEPENDENTLY

NOT_STARTED

Mahasiswa belum mulai mempelajari topic.

LEARNING

Mahasiswa sedang mempelajari konsep.

PRACTICING

Mahasiswa sudah mencoba menggunakan konsep tersebut.

CAN_DO_INDEPENDENTLY

Mahasiswa merasa mampu menggunakan konsep tanpa mengikuti tutorial langkah demi langkah.

⸻

12. 25-Minute Learning Sprint

12.1 Definition

Learning Sprint adalah aktivitas belajar mandiri dengan minimum:

25 menit focused learning.

25 menit merupakan minimum learning habit, bukan nilai.

⸻

12.2 Sprint Information

Setiap Sprint minimal mencatat:

Topic
Duration
What I learned
What I practiced
What is still confusing
Evidence

Contoh:

Topic:
Flexbox
Duration:
32 minutes
What I learned:
Saya memahami perbedaan justify-content
dan align-items.
What I practiced:
Membuat navbar menggunakan Flexbox.
Still confusing:
Saya masih bingung kapan menggunakan
Grid dibanding Flexbox.
Evidence:
GitHub URL

⸻

13. 25-Minute Rule

Sistem dapat membedakan:

< 25 minutes
Target Not Reached
≥ 25 minutes
Target Reached

Tetapi sistem tidak boleh melakukan:

25 min = 1 point
50 min = 2 points
100 min = 4 points

Karena hal tersebut akan mengubah tujuan Learning Sprint menjadi sekadar mengejar timer.

⸻

14. Evidence

Evidence adalah bukti tambahan dari aktivitas belajar.

Supported evidence:

GitHub
GitHub Pages
Loom
Figma
Live Website
Other URL

GitHub tidak menjadi sumber kebenaran progress.

Mahasiswa dapat belajar tanpa GitHub dan tetap mencatat Learning Sprint.

⸻

15. Peer Feedback

Mahasiswa dapat memberikan feedback terhadap evidence atau aktivitas belajar teman.

Contoh:

“Di mobile masih ada horizontal overflow.”

“Bagian navbar sudah bagus, tapi menurut saya spacing-nya terlalu rapat.”

“Saya juga baru paham Grid setelah melihat implementasi kamu.”

Feedback bersifat:

* kualitatif;
* konstruktif;
* tidak bernilai akademik.

⸻

16. Peer Feedback Rules

Tidak ada:

⭐⭐⭐⭐⭐
85/100
A
B
C

Tidak ada leaderboard.

Tidak ada:

“Mahasiswa dengan feedback terbanyak.”

Peer feedback hanya bertujuan:

support learning.

⸻

17. Student Dashboard

Dashboard mahasiswa harus menjawab tiga pertanyaan:

1. Saya harus belajar apa?

THIS WEEK
Responsive Design

2. Saya sudah sampai mana?

HTML       ██████████████████
CSS        ██████████████░░░░
JavaScript ████░░░░░░░░░░░░░░

3. Apa yang harus saya lakukan selanjutnya?

Next:
Practice responsive navbar
Minimum:
25 minutes
[Start Learning Sprint]

⸻

18. Class Dashboard

Dashboard kelas digunakan untuk social accountability dan monitoring.

Contoh:

CLASS PROGRESS
HTML
██████████████████ 91%
CSS
███████████████░░░ 78%
JavaScript
██████░░░░░░░░░░░░ 32%

Aktivitas:

67 / 90 students active this week
24 completed a Learning Sprint today
43 peer feedback given

Dashboard tidak menampilkan ranking.

⸻

19. Student Public/Class Profile

Mahasiswa dapat memiliki progress yang terlihat oleh anggota kelas.

Contoh:

Andi
Learning Progress
HTML       ████████████████
CSS        ████████████░░░░
JavaScript ████░░░░░░░░░░░░
Current focus:
Responsive Design
Recent activity:
Completed Flexbox Sprint

Informasi sensitif seperti email, NIM, private reflection, dan private notes tidak ditampilkan.

⸻

20. Teaching Assistant Dashboard

Dashboard TA harus fokus pada actionable information, bukan vanity metrics.

Prioritas:

Current Week

Week 2 — CSS + Responsive

Class Progress

HTML       91%
CSS        78%
JavaScript 32%

Learning Activity

67 / 90 active this week

Students with no recent activity

23 students

Common confusion

Responsive Design
18 mentions
Flexbox vs Grid
11 mentions
Media Query
8 mentions

Recent Evidence

Menampilkan evidence terbaru jika TA ingin melakukan review.

⸻

21. Monitoring Philosophy

Sistem tidak bertujuan membuat TA memeriksa semua mahasiswa.

Sistem harus membantu TA berpindah dari:

90 mahasiswa
↓
90 Google Form
↓
90 GitHub
↓
90 review

menjadi:

Class Dashboard
↓
Identifikasi pola
↓
Identifikasi mahasiswa/topik yang membutuhkan perhatian
↓
Drill down jika diperlukan

⸻

22. Progress Metrics

Sistem boleh menampilkan:

Checklist Progress

Berapa banyak checklist yang telah ditandai mahasiswa.

Learning Activity

* jumlah Sprint;
* total menit;
* jumlah Sprint yang mencapai ≥25 menit;
* aktivitas minggu berjalan;
* last activity.

Peer Activity

* jumlah feedback;
* recent feedback.

Metrics tersebut bukan nilai akademik.

⸻

23. Tidak Ada Competency Score

Sistem tidak boleh menghasilkan:

HTML Competency = 87%
CSS Competency = 73%

karena sistem tidak melakukan assessment formal.

Jika ditampilkan progress percentage, label harus jelas:

Self-assessed learning progress

bukan:

Competency Score.

⸻

24. Data Mahasiswa Saat Ini

Data yang sudah tersedia:

Name
Email
NIM
Class
GitHub Repository
GitHub Page

Penggunaan:

Data	Fungsi
Name	Identitas
Email	Authentication
NIM	Identitas akademik
Class	Scope dashboard
GitHub Repository	Supporting evidence
GitHub Page	Supporting evidence

GitHub tidak menjadi pusat sistem.

⸻

25. UX Principles

25.1 Minimal Friction

Mahasiswa harus dapat mencatat Learning Sprint tanpa mengisi form panjang.

⸻

25.2 No Duplicate Submission

Jika mahasiswa sudah mencatat aktivitas di sistem, tidak perlu mengisi Google Form terpisah untuk aktivitas tersebut.

⸻

25.3 Dashboard First

Informasi penting harus terlihat tanpa membuka banyak halaman.

⸻

25.4 Clear Next Action

Mahasiswa harus selalu mengetahui:

“Sekarang saya harus melakukan apa?”

⸻

25.5 No Shame-Based Monitoring

Hindari label seperti:

LAZY
FAILED
AT RISK
BOTTOM 10

Gunakan bahasa netral:

No recent activity
Needs practice
Not started

⸻

26. MVP Feature Set

MVP hanya membutuhkan:

Authentication
        ↓
Student + Class
        ↓
Roadmap
        ↓
Checklist
        ↓
Learning Sprint
        ↓
Evidence
        ↓
Self Assessment
        ↓
Peer Feedback
        ↓
Student Dashboard
        ↓
Class Dashboard
        ↓
TA Dashboard

⸻

27. MVP User Flow

Student

Login
 ↓
See current week
 ↓
See learning checklist
 ↓
Choose topic
 ↓
Learn ≥25 minutes
 ↓
Record Sprint
 ↓
Write reflection
 ↓
Attach evidence
 ↓
Update self-assessment
 ↓
See peer activity
 ↓
Give feedback

⸻

Teaching Assistant

Login
 ↓
See current week
 ↓
See class progress
 ↓
See learning activity
 ↓
See common confusion
 ↓
Identify students/topics needing attention
 ↓
Open evidence if necessary

⸻

28. Future Features

Tidak menjadi bagian MVP.

Potential future:

* GitHub API integration.
* Automated browser testing untuk challenge tertentu.
* Automated reminders.
* Notification integration.
* More advanced project tracking.
* Optional LMS integration.
* Calendar integration.

Setiap future feature harus divalidasi terhadap masalah nyata sebelum dibuat.

⸻

29. Feature Decision Rule

Sebelum menambahkan fitur, tanyakan:

Question 1

Apakah fitur ini membantu mahasiswa belajar?

Question 2

Apakah fitur ini membantu mahasiswa memahami progress mereka?

Question 3

Apakah fitur ini membantu mahasiswa saling membantu?

Question 4

Apakah fitur ini membantu TA memonitor kelas?

Question 5

Apakah fitur ini menambah pekerjaan administratif TA?

Jika fitur tidak memberikan manfaat yang jelas dan justru menambah workload, fitur harus ditolak atau ditunda.

⸻

30. Definition of Success

Learning Progress Tracker dianggap berhasil apabila:

Student

Mahasiswa:

* mengetahui apa yang harus dipelajari;
* melakukan learning sprint secara konsisten;
* dapat melihat progress sendiri;
* dapat mengidentifikasi kekurangan;
* mendapatkan feedback dari teman;
* secara bertahap mampu mengerjakan project.

Teaching Assistant

TA:

* tidak lagi bergantung pada banyak Google Form/Sheet untuk monitoring;
* dapat melihat kondisi 2 kelas dari satu dashboard;
* dapat menemukan pola masalah pembelajaran;
* tidak perlu membuka GitHub satu per satu hanya untuk mengetahui progress umum;
* memiliki lebih banyak waktu untuk mengajar dan membantu mahasiswa.

⸻

31. Final Product Definition

Learning Progress Tracker adalah dashboard pembelajaran ringan yang membantu mahasiswa mengetahui apa yang harus dipelajari, mencatat proses belajar minimal 25 menit, melakukan self-assessment, membagikan evidence, dan saling memberikan feedback — sementara asisten dosen dapat memantau progress dua kelas tanpa harus melakukan monitoring manual terhadap setiap mahasiswa.

Bukan LMS.
Bukan gradebook.
Bukan competency assessment.
Bukan AI tutor.

Hanya learning-progress tracker.