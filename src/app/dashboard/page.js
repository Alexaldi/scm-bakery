const summaryCards = [
  {
    title: "Total Produk",
    value: "5",
    description: "Produk bakery aktif",
  },
  {
    title: "Bahan Baku",
    value: "10",
    description: "Bahan terdaftar",
  },
  {
    title: "Supplier",
    value: "30",
    description: "Supplier tersedia",
  },
  {
    title: "Stok Menipis",
    value: "3",
    description: "Perlu segera diperiksa",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard
        </h2>

        <p className="mt-1 text-gray-600">
          Ringkasan aktivitas Supply Chain Management.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">
              {card.title}
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {card.value}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {card.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">
          Alur Utama Aplikasi
        </h3>

        <p className="mt-3 leading-7 text-gray-600">
          Penjualan → Peramalan → BOM → Inventory → Pemilihan
          Supplier → Pengadaan → Produksi → Distribusi
        </p>
      </div>
    </div>
  );
}