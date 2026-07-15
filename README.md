# SCM Bakery

Aplikasi Supply Chain Management bakery berbasis Next.js App Router. Arah proyek sekarang adalah aplikasi database-backed, bukan lagi prototype berbasis `localStorage`.

## Status

- Data runtime berasal dari PostgreSQL lewat Prisma.
- Auth memakai user database, password hash PBKDF2, JWT cookie httpOnly, dan role server-side.
- Runtime dashboard membaca snapshot data melalui `src/lib/db/scm-data.js`.
- Master Produk memakai production slice sendiri: Server Component membaca database, Server Action menulis database, Client Component mengurus UI.
- Halaman lama masih memakai `src/context/scm-context.js` sebagai facade UI, tetapi aksi utama sudah diarahkan ke Server Actions.
- `src/lib/mock-data` hanya boleh dipakai sebagai referensi/seed development, bukan sumber data runtime aplikasi.

## Peta Kode Singkat

- `src/app`: route App Router.
- `src/app/login`: halaman login dan Server Action auth.
- `src/app/dashboard/layout.js`: guard session, load data SCM, dan shell dashboard.
- `src/app/dashboard/master/products`: contoh slice database-backed yang paling bersih.
- `src/context/scm-context.js`: facade client untuk halaman lama.
- `src/context/scm-actions.js`: Server Actions untuk mutasi flow dashboard lama.
- `src/lib/auth`: JWT, hash password, session cookie, dan permission role.
- `src/lib/db`: koneksi Prisma dan loader data dashboard.
- `src/lib/services`: regresi linier, kebutuhan bahan, Weighted Product, dan pengadaan.
- `src/proxy.js`: guard route dashboard dan login berdasarkan JWT.
- `prisma/schema.prisma`: desain tabel database.
- `prisma/seed.js`: data awal development.

## Cara Menjalankan

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Buka `http://localhost:3000`, lalu login.

Akun seed development memakai password `bakery12345`:

- `admin@scm-bakery.local`
- `ppic@scm-bakery.local`
- `purchasing@scm-bakery.local`
- `gudang@scm-bakery.local`
- `produksi@scm-bakery.local`
- `distribusi@scm-bakery.local`

Validasi produksi:

```bash
npm run lint
npm run build
```

## Environment

Salin `.env.example` menjadi `.env`, lalu isi `DATABASE_URL` PostgreSQL dan `AUTH_SECRET`.

## Keterbatasan Saat Ini

- Beberapa halaman masih memakai Context sebagai facade UI agar diff migrasi tetap kecil.
- Belum ada audit log transaksi stok, PO, produksi, dan distribusi.
- Export laporan masih simulasi, belum membuat file Excel/PDF.
