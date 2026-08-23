export interface ChecklistSeedItem {
  statement: string;
}

export interface TopicSeedItem {
  title: string;
  category: 'HTML' | 'CSS' | 'JAVASCRIPT' | 'BACKEND' | 'FULLSTACK';
  sortOrder: number;
  checklists: string[];
}

export interface WeekSeedItem {
  weekNumber: number;
  title: string;
  description: string;
  isCurrent: boolean;
  topics: TopicSeedItem[];
}

export const initialCurriculum: WeekSeedItem[] = [
  {
    weekNumber: 1,
    title: 'HTML & CSS Fundamentals',
    description: 'Membuat halaman web yang terstruktur semantik, rapi, responsive, dan menjadi fondasi project nyata.',
    isCurrent: true,
    topics: [
      {
        title: 'Web Fundamentals & Semantic HTML',
        category: 'HTML',
        sortOrder: 1,
        checklists: [
          'Saya memahami peran browser, client, server, HTTP request/response, dan fungsi HTML vs CSS vs JS',
          'Saya dapat menyusun struktur HTML5 semantik (header, nav, main, section, article, footer)',
          'Saya bisa membuat form lengkap (input, textarea, select, label, button) dan halaman profil/produk terstruktur',
        ],
      },
      {
        title: 'CSS Selectors, Box Model & Styling',
        category: 'CSS',
        sortOrder: 2,
        checklists: [
          'Saya memahami selector hierarchy, class, ID, cascade, dan specificity CSS dasar',
          'Saya memahami cara kerja box model (content, padding, border, margin) dan konsisten memakai box-sizing: border-box',
          'Saya dapat mengatur typography, color, border-radius, dan subtle shadow secara rapi',
        ],
      },
      {
        title: 'CSS Layout (Flexbox & Grid)',
        category: 'CSS',
        sortOrder: 3,
        checklists: [
          'Saya memahami flex container vs items (justify-content, align-items, gap, flex-direction)',
          'Saya memahami CSS Grid dasar (grid-template-columns, gap, repeat auto-fit/minmax)',
          'Minimum Challenge: Saya bisa membuat layout navbar + hero + 3 card + footer tanpa tutorial step-by-step',
        ],
      },
      {
        title: 'Responsive Design & Media Queries',
        category: 'CSS',
        sortOrder: 4,
        checklists: [
          'Saya memahami relative units (%, rem, vh, vw) dan DevTools responsive viewport inspection',
          'Minimum Challenge: Saya bisa menulis media queries agar seluruh halaman tetap rapi dan usable di mobile',
        ],
      },
    ],
  },
  {
    weekNumber: 2,
    title: 'JavaScript & DOM Interaction',
    description: 'Membangun antarmuka web dinamis yang memiliki behavior, pengolahan data, dan event interactivity.',
    isCurrent: false,
    topics: [
      {
        title: 'JavaScript Core & Array/Object Data',
        category: 'JAVASCRIPT',
        sortOrder: 1,
        checklists: [
          'Saya memahami let/const, tipe data primitif vs reference, template literals, dan ternary operator',
          'Saya memahami function declaration, arrow function, dan scope (block vs function scope)',
          'Saya mahir memanipulasi array of objects menggunakan map, filter, find, reduce, includes',
        ],
      },
      {
        title: 'DOM Manipulation & Event Handling',
        category: 'JAVASCRIPT',
        sortOrder: 2,
        checklists: [
          'Saya bisa memilih elemen DOM dengan querySelector/querySelectorAll dan mengubah text/HTML/class secara dinamis',
          'Saya bisa menangani event listener (click, input, submit) dan mencegah reload default form (preventDefault)',
          'Minimum Challenge: Saya bisa membuat aplikasi Todo / Filterable Card List yang render secara dinamis dari array state',
        ],
      },
      {
        title: 'Browser Storage & State Persistence',
        category: 'JAVASCRIPT',
        sortOrder: 3,
        checklists: [
          'Saya memahami cara menyimpan dan membaca data JSON dengan localStorage / sessionStorage',
        ],
      },
    ],
  },
  {
    weekNumber: 3,
    title: 'Asynchronous JS, Fetch API & Git Collaboration',
    description: 'Mengintegrasikan data eksternal via API dan alur kolaborasi version control standar industri.',
    isCurrent: false,
    topics: [
      {
        title: 'Async/Await & REST API Integration',
        category: 'JAVASCRIPT',
        sortOrder: 1,
        checklists: [
          'Saya memahami konsep Asynchronous, Promise, dan sintaks async/await',
          'Saya bisa melakukan HTTP fetch (GET, POST) ke public REST API dan parsing response JSON',
          'Saya bisa mengimplementasikan 3 state UI penting: Loading State, Success Render, dan Error Handling Alert',
          'Minimum Challenge: Saya bisa membuat Mini App (Weather / Movie / GitHub Explorer) yang fetch data real',
        ],
      },
      {
        title: 'Git Version Control & Deployment',
        category: 'FULLSTACK',
        sortOrder: 2,
        checklists: [
          'Saya menguasai perintah git init, add, commit, branch, merge, dan resolve merge conflict',
          'Saya bisa push project ke GitHub dan melakukan live deployment via GitHub Pages, Vercel, atau Netlify',
        ],
      },
    ],
  },
  {
    weekNumber: 4,
    title: 'Modern Frontend with React & State Management',
    description: 'Membangun Single Page Application komponen modular dengan React, Hooks, dan Typed props.',
    isCurrent: false,
    topics: [
      {
        title: 'React Fundamentals & Component Architecture',
        category: 'JAVASCRIPT',
        sortOrder: 1,
        checklists: [
          'Saya memahami JSX, Virtual DOM, unidirectional data flow, dan pemecahan UI ke komponen reusable',
          'Saya memahami pemisahan props vs state dan passing callback handler ke child component',
        ],
      },
      {
        title: 'React Hooks & Side Effects',
        category: 'JAVASCRIPT',
        sortOrder: 2,
        checklists: [
          'Saya menguasai useState untuk mengelola form input dan dynamic list array',
          'Saya menguasai useEffect untuk fetch data saat mount dan memahami dependency array',
          'Minimum Challenge: Saya bisa membuat Dynamic Interactive App dengan React tanpa error re-render infinite loop',
        ],
      },
    ],
  },
  {
    weekNumber: 5,
    title: 'Backend API Development with Node.js & Express',
    description: 'Merancang RESTful API production-grade, routing modular, dan request validation di sisi server.',
    isCurrent: false,
    topics: [
      {
        title: 'Node.js Runtime & Express Server Setup',
        category: 'BACKEND',
        sortOrder: 1,
        checklists: [
          'Saya memahami peran Node.js runtime, npm package management, dan arsitektur server client-backend',
          'Saya bisa membuat server Express dengan routing modular, express.json() middleware, dan CORS configuration',
        ],
      },
      {
        title: 'RESTful API Design & Input Validation',
        category: 'BACKEND',
        sortOrder: 2,
        checklists: [
          'Saya dapat merancang endpoint RESTful (GET, POST, PUT/PATCH, DELETE) dengan HTTP Status Code yang tepat (200, 201, 400, 404, 500)',
          'Saya mengimplementasikan middleware validasi skema request body menggunakan Zod / Joi',
          'Minimum Challenge: Saya bisa membuat CRUD API lengkap yang teruji via Postman / Bruno / ThunderClient',
        ],
      },
    ],
  },
  {
    weekNumber: 6,
    title: 'Relational Database with PostgreSQL & Drizzle ORM',
    description: 'Pemodelan relasi database relational, skema migration, dan agregasi data SQL.',
    isCurrent: false,
    topics: [
      {
        title: 'Database Design, Tables & Relational Modeling',
        category: 'BACKEND',
        sortOrder: 1,
        checklists: [
          'Saya memahami konsep RDBMS, Primary Key, Foreign Key, dan relasi 1:N serta N:M',
          'Saya bisa mendesain skema tabel normalisasi (users, posts, categories, comments)',
        ],
      },
      {
        title: 'PostgreSQL & Drizzle ORM Migration',
        category: 'BACKEND',
        sortOrder: 2,
        checklists: [
          'Saya dapat mengkoneksikan Express ke PostgreSQL menggunakan Drizzle ORM / Prisma',
          'Saya bisa menjalankan database migration dan menulis query SELECT, JOIN, INSERT, UPDATE, DELETE via ORM',
          'Minimum Challenge: Seluruh data aplikasi CRUD tersimpan permanen di database PostgreSQL dengan relasi foreign key',
        ],
      },
    ],
  },
  {
    weekNumber: 7,
    title: 'Authentication, Security & Fullstack Integration',
    description: 'Mengamankan API dengan JWT, password hashing/OAuth, dan integrasi frontend ke backend terproteksi.',
    isCurrent: false,
    topics: [
      {
        title: 'Authentication & Authorization (JWT / OAuth)',
        category: 'BACKEND',
        sortOrder: 1,
        checklists: [
          'Saya memahami perbedaan Authentication (siapa Anda) vs Authorization (role & izin akses)',
          'Saya bisa mengimplementasikan login/register aman dengan bcrypt password hashing atau Google OAuth 2.0',
          'Saya bisa membuat Auth Middleware yang memverifikasi JWT Bearer token pada route privat',
        ],
      },
      {
        title: 'Fullstack Client-Server Connection',
        category: 'FULLSTACK',
        sortOrder: 2,
        checklists: [
          'Saya bisa menghubungkan Frontend React ke Backend API milik sendiri dengan Bearer Token authorization header',
          'Saya bisa menangani protected routing di frontend (redirect ke login jika belum authenticated)',
          'Minimum Challenge: Alur Auth lengkap dari frontend ke backend bekerja mulus dengan user session tersimpan',
        ],
      },
    ],
  },
  {
    weekNumber: 8,
    title: 'Production Deployment & Capstone Project',
    description: 'Peluncuran produk fullstack ke lingkungan production live cloud dengan database hosting.',
    isCurrent: false,
    topics: [
      {
        title: 'Environment Variables & Production Security',
        category: 'FULLSTACK',
        sortOrder: 1,
        checklists: [
          'Saya memahami manajemen .env, pemisahan credential rahasia dari git commit, dan konfigurasi CORS production',
          'Saya mengerti cara penanganan error global tanpa mengekspos stack trace sensitif ke client',
        ],
      },
      {
        title: 'Cloud Deployment & Live Showcase',
        category: 'FULLSTACK',
        sortOrder: 2,
        checklists: [
          'Saya bisa men-deploy database PostgreSQL ke cloud (Supabase / Neon / Render)',
          'Saya bisa men-deploy Backend Express ke cloud platform (Render / Railway / Fly.io / VPS)',
          'Saya bisa men-deploy Frontend ke Netlify / Vercel dan menghubungkannya ke live backend URL',
          'Minimum Challenge: Aplikasi Fullstack utuh live di internet, dapat diakses publik, dan siap dipresentasikan',
        ],
      },
    ],
  },
];
