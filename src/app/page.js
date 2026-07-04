import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center">
        <section className="w-full rounded-lg border border-gray-200 bg-white p-8">
          <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">Prototype Akademik</p>
          <h1 className="mt-3 text-3xl font-semibold text-gray-900">SCM Bakery</h1>
          <p className="mt-3 max-w-2xl leading-7 text-gray-600">
            Aplikasi demo Supply Chain Management bakery untuk alur penjualan, peramalan, pengadaan,
            penerimaan bahan, produksi, distribusi, dan laporan.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Masuk ke Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
