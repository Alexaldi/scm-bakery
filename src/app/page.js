export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">
            SCM Bakery
          </h1>

          <p className="mt-2 text-gray-600">
            Sistem Supply Chain Management untuk mengelola penjualan,
            peramalan, pengadaan, produksi, dan distribusi.
          </p>

          <div className="mt-6 rounded-lg border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900">
              Status Project
            </h2>

            <p className="mt-1 text-sm text-gray-600">
              Project Next.js berhasil dijalankan.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
