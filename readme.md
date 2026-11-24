# 🚀 Express.js + Prisma 7 + PostgreSQL Boilerplate

Template project backend modern menggunakan **Express.js**, **Prisma ORM (Versi 7)**, dan **PostgreSQL**. Menggunakan arsitektur *Clean Architecture* dengan dukungan penuh ES Modules.

---

## ⚡ Quick Start (Cara Menggunakan Template Ini)

Jika Anda menggunakan template ini dari Github, Anda **tidak perlu** meng-install library satu per satu. Cukup ikuti 5 langkah cepat ini:

```bash
# 1. Clone repository
git clone https://github.com/aldennayef/template-express-js.git
cd template-express-js

# 2. Install semua dependencies otomatis (membaca package.json)
npm install

# 3. Setup Environment Variables
# Buat file .env dan isi dengan DATABASE_URL Anda:
# DATABASE_URL="postgresql://user:password@localhost:5432/namadb?schema=public"

# 4. Sinkronisasi Database
npx prisma db pull      # Jika database sudah ada tabelnya
# ATAU
npx prisma migrate dev  # Jika database masih kosong

# 5. Jalankan Server
node server.js
```

---

> **💡 Ingin Membangun Sendiri Dari Nol?**
> Jika Anda tidak ingin menggunakan template ini (tidak ingin clone), dan lebih memilih belajar membuat arsitektur ini secara manual dari awal, silakan *scroll* ke bawah dan ikuti **Bagian Panduan Instalasi**.

## 📁 Struktur Direktori

Struktur proyek ini didesain agar mudah di-scale dan di-maintain:

```text
📦 root
 ┣ 📂 src
 ┃ ┣ 📂 config       # Konfigurasi aplikasi (CORS, Multer, dll)
 ┃ ┣ 📂 controllers  # Menangani alur Request & Response
 ┃ ┣ 📂 middlewares  # Fungsi penengah (Autentikasi JWT, dll)
 ┃ ┣ 📂 routes       # Mengatur alamat Endpoint API
 ┃ ┣ 📂 services     # Logika bisnis & interaksi Database (Prisma)
 ┃ ┣ 📂 utils        # Fungsi bantuan (*Helper*)
 ┃ ┗ 📂 validators   # Validasi input data Frontend
 ┣ 📜 server.js      # Titik masuk utama aplikasi (Entry point)
 ┗ 📜 package.json
```

---

## 🛠️ Panduan Instalasi

### 1. Inisialisasi Proyek
```bash
npm init -y
```

### 2. Konfigurasi ES Modules
> ⚠️ **PENTING:** Buka file `package.json` dan tambahkan baris berikut agar Node.js mendukung sintaks `import`:
```json
{
  "type": "module"
}
```

### 3. Install Dependencies
```bash
npm install express dotenv prisma @prisma/client
npm install pg @prisma/adapter-pg
npm install -D nodemon
npm i --save-dev @types/node
```

### 4. Inisialisasi Prisma
```bash
npx prisma init
```

---

## 🗄️ Setup Database

Di dalam file `.env`, pastikan Anda sudah menyesuaikan `DATABASE_URL` ke server PostgreSQL Anda:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/namadb?schema=public"
```

### Skenario A: Jika Database Sudah Memiliki Tabel
Tarik struktur database yang sudah ada ke dalam proyek lokal Anda:
```bash
npx prisma db pull
npx prisma generate
```

### Skenario B: Jika Database Masih Kosong
1. Desain struktur model tabel Anda di dalam file `prisma/schema.prisma`.
2. Dorong (Migrate) skema tersebut menjadi tabel nyata di database:
```bash
npx prisma migrate dev --name init
```
*(Catatan: Perintah ini sudah otomatis melakukan `npx prisma generate`)*

---

## 🔌 Konfigurasi Prisma Client (Prisma 7)

Prisma versi 7 mewajibkan penggunaan **Driver Adapter** untuk koneksi database. Buat file `prisma.js` (misal di folder `prisma/prisma.js` atau `src/config/prisma.js`) dengan konfigurasi berikut:

```javascript
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Setup koneksi PostgreSQL
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

// Inisialisasi Prisma dengan Adapter (Syarat Mutlak Prisma 7)
const prisma = new PrismaClient({ adapter });

export default prisma;
```

---

## 📖 Swagger API Documentation
Dokumentasi interaktif dapat diakses langsung melalui browser:
- **Swagger UI**: [http://localhost:8899/api-docs](http://localhost:8899/api-docs)
- **OpenAPI JSON Spec**: [http://localhost:8899/api-docs.json](http://localhost:8899/api-docs.json)

Fitur Swagger:
- Mencakup semua endpoint transaksi (`CRUD`) dan keep-alive.
- Mendukung fitur **Authorize** (memasukkan token JWT `Bearer <token>` untuk langsung mencoba endpoint yang dilindungi).
- Mencakup endpoint autentikasi (`/api/auth/login`) untuk memudahkan generate token langsung dari UI.

---

## 📊 API Transaksi (CRUD & Keep-Alive)

Endpoint CRUD transaksi dilindungi oleh **JWT (JSON Web Token)** via header `Authorization: Bearer <token>`, kecuali endpoint **Keep-Alive** yang bersifat publik.

### 1. Keep-Alive (Publik - Tanpa JWT)
Bisa digunakan oleh cron job (misal UptimeRobot) agar instance server & database Supabase tidak *pause* / tidur:
- `GET /keep-alive`
- `GET /api/transactions/keep-alive`

Contoh Response (200 OK):
```json
{
  "status": "success",
  "message": "Keep-alive ping berhasil, server dan database aktif.",
  "data": {
    "status": "ok",
    "database": "connected",
    "latency": "42ms",
    "timestamp": "2026-11-24T17:35:00.000Z"
  }
}
```

### 2. CRUD Transaksi (Wajib JWT: `Authorization: Bearer <token>`)

| Method | Endpoint | Deskripsi | Query / Body |
|---|---|---|---|
| `GET` | `/api/transactions` | Ambil semua transaksi (Pagination & Filter) | Query: `page`, `limit`, `type`, `category`, `search`, `startDate`, `endDate` |
| `GET` | `/api/transactions/:id` | Ambil 1 transaksi berdasarkan ID | Param: `id` |
| `POST` | `/api/transactions` | Tambah transaksi baru | Body JSON: `title`, `amount`, `type`, `category` (opsional), `description` (opsional), `date` (opsional) |
| `PUT` | `/api/transactions/:id` | Perbarui transaksi berdasarkan ID | Param: `id`, Body JSON: kolom yang ingin diubah |
| `DELETE` | `/api/transactions/:id` | Hapus transaksi | Param: `id` |

#### Contoh Request Body `POST /api/transactions`:
```json
{
  "title": "Beli Bahan Baku",
  "amount": 150000.50,
  "type": "EXPENSE",
  "category": "Operasional",
  "description": "Pembelian bahan baku produksi",
  "date": "2026-11-24T10:00:00.000Z"
}
```

---

## ⚡ Supabase Setup & Migration

1. Ambil URL koneksi dari Dashboard Supabase Anda (**Project Settings** > **Database** > **Connection string** > **URI**).
2. Di file `.env`, isi `DATABASE_URL`:
   ```env
   # Mode Direct (Port 5432):
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

   # Atau Mode Connection Pooling (Port 6543):
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```
3. Dorong skema Prisma langsung ke Supabase:
   ```bash
   npx prisma db push
   ```

---

## 🚀 Menjalankan Aplikasi

Jalankan perintah berikut di terminal:
```bash
node server.js
```
*(Jika ingin server otomatis restart saat ada perubahan kode, gunakan `npx nodemon server.js`)*