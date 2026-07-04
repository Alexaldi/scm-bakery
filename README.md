# SCM Bakery Prototype

Prototype UI interaktif untuk aplikasi Supply Chain Management bakery. Aplikasi ini memakai Next.js App Router, JavaScript, Tailwind CSS, React Context, dan `localStorage` sebagai penyimpanan demo.

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`, lalu masuk ke `/dashboard`.

Validasi produksi:

```bash
npm run lint
npm run build
```

## Asumsi Arsitektur

- Prototype tidak memakai database, API routes, server actions, Prisma, atau autentikasi asli.
- Semua perubahan data disimpan di React Context dan `localStorage`.
- Tombol `Reset Data Demo` mengembalikan data ke mock data awal.
- Role simulator hanya mengubah tampilan menu untuk demo, bukan keamanan aplikasi.
- Periode demo memakai histori Juli 2025 sampai Juni 2026 dan forecast Juli 2026.

## Demo Scenario

1. Buka `Penjualan`, tambah atau edit penjualan bulanan.
2. Buka `Peramalan Produksi`, pilih produk, klik `Hitung Forecast`, lalu `Setujui & Simpan`.
3. Buka `Kebutuhan Bahan`, klik `Hitung Kebutuhan Bahan`.
4. Buka `Pemilihan Supplier`, pilih bahan baku, isi kebutuhan, lalu hitung ranking Weighted Product.
5. Buka `Pengadaan`, klik `Buat Rencana Pengadaan`.
6. Buka `Purchase Order`, pilih rencana pengadaan, lalu buat PO.
7. Buka `Penerimaan Bahan`, konfirmasi penerimaan parsial atau penuh.
8. Buka `Produksi`, buat order produksi, siapkan bahan, mulai, lalu selesaikan produksi.
9. Buka `Distribusi`, jadwalkan pengiriman dan konfirmasi kirim.
10. Buka `Laporan` untuk melihat ringkasan dan simulasi export/cetak.

## Keterbatasan Prototype

- Export laporan hanya menampilkan notifikasi simulasi, tidak membuat file Excel/PDF.
- Print memakai fitur cetak browser.
- Semua data bersifat mock dan tersimpan per browser.
- Tidak ada validasi multi-user, permission server-side, atau audit log permanen.
