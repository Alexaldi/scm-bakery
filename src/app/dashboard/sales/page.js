const sales = [
  {
    id: 1,
    product: "Butter Croissant",
    period: "Januari 2026",
    quantity: 1250,
  },
  {
    id: 2,
    product: "Chocolate Danish",
    period: "Januari 2026",
    quantity: 980,
  },
  {
    id: 3,
    product: "Cheese Bun",
    period: "Januari 2026",
    quantity: 870,
  },
];

export default function SalesPage() {
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Penjualan
        </h2>

        <p className="mt-1 text-gray-600">
          Data penjualan akan digunakan untuk proses peramalan.
        </p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Produk
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Periode
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                Jumlah Terjual
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {sale.product}
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {sale.period}
                </td>

                <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                  {sale.quantity.toLocaleString("id-ID")} pcs
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}