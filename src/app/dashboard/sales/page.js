"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ConfirmDialog from "@/components/confirm-dialog";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import SearchInput from "@/components/search-input";
import StatCard from "@/components/stat-card";
import { useScm } from "@/context/scm-context";
import { formatNumber, formatPeriod, searchText } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const emptySale = {
  productId: "",
  period: "2026-07",
  quantity: 0,
  channel: "Retail",
};

export default function SalesPage() {
  const { products, monthlySales, saveMonthlySale, deleteRecord } = useScm();
  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("Semua");
  const [periodFilter, setPeriodFilter] = useState("Semua");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ ...emptySale, productId: products[0]?.id || "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const periods = useMemo(() => ["Semua", ...new Set(monthlySales.map((sale) => sale.period).sort())], [monthlySales]);
  const rows = monthlySales
    .map((sale) => ({
      ...sale,
      product: products.find((product) => product.id === sale.productId),
      productName: products.find((product) => product.id === sale.productId)?.name || "-",
    }))
    .filter(
      (sale) =>
        searchText(sale, ["productName", "period", "channel"], search) &&
        (productFilter === "Semua" || sale.productId === productFilter) &&
        (periodFilter === "Semua" || sale.period === periodFilter)
    )
    .sort((a, b) => b.period.localeCompare(a.period));

  const totalSold = rows.reduce((total, sale) => total + Number(sale.quantity || 0), 0);
  const productTotals = products.map((product) => ({
    product,
    total: monthlySales
      .filter((sale) => sale.productId === product.id)
      .reduce((total, sale) => total + Number(sale.quantity || 0), 0),
  }));
  const bestProduct = productTotals.sort((a, b) => b.total - a.total)[0];
  const chartData = monthlySales
    .filter((sale) => productFilter === "Semua" || sale.productId === productFilter)
    .reduce((result, sale) => {
      const existing = result.find((item) => item.period === sale.period);
      if (existing) {
        existing.quantity += Number(sale.quantity || 0);
        return result;
      }
      return [...result, { period: sale.period, label: formatPeriod(sale.period).slice(0, 3), quantity: Number(sale.quantity || 0) }];
    }, [])
    .sort((a, b) => a.period.localeCompare(b.period));
  const last = chartData.at(-1)?.quantity || 0;
  const previous = chartData.at(-2)?.quantity || 0;
  const trend = previous === 0 ? 0 : ((last - previous) / previous) * 100;

  function openCreateModal() {
    setForm({ ...emptySale, productId: products[0]?.id || "" });
    setModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    saveMonthlySale(form);
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Penjualan"
        description="Data penjualan bulanan menjadi input utama untuk peramalan produksi dengan regresi linier."
        actions={
          <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Penjualan
          </button>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <StatCard title="Total Unit Terjual" value={`${formatNumber(totalSold)} pcs`} />
        <StatCard title="Produk Terlaris" value={bestProduct?.product?.name || "-"} description={`${formatNumber(bestProduct?.total || 0)} pcs`} />
        <StatCard title="Tren Bulan Terakhir" value={`${trend >= 0 ? "+" : ""}${formatNumber(trend, { maximumFractionDigits: 1 })}%`} description="Dibanding bulan sebelumnya" tone={trend >= 0 ? "green" : "red"} />
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Grafik Penjualan Bulanan</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value) => [`${formatNumber(value)} pcs`, "Penjualan"]} labelFormatter={(label) => `Bulan ${label}`} />
              <Line type="monotone" dataKey="quantity" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="my-4 grid gap-3 md:grid-cols-[1fr_14rem_12rem]">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari produk, periode, atau channel..." />
        <select value={productFilter} onChange={(event) => setProductFilter(event.target.value)} className={inputClass}>
          <option value="Semua">Semua Produk</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
        <select value={periodFilter} onChange={(event) => setPeriodFilter(event.target.value)} className={inputClass}>
          {periods.map((period) => (
            <option key={period} value={period}>
              {period === "Semua" ? "Semua Periode" : formatPeriod(period)}
            </option>
          ))}
        </select>
      </div>

      <DataTableWrapper empty={rows.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Periode</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Channel</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Jumlah Terjual</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((sale) => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{sale.productName}</td>
                <td className="px-4 py-3 text-gray-600">{formatPeriod(sale.period)}</td>
                <td className="px-4 py-3 text-gray-600">{sale.channel}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatNumber(sale.quantity)} pcs</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setForm(sale); setModalOpen(true); }} className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Edit penjualan">
                      <Edit className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(sale)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Hapus penjualan">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableWrapper>

      <FormModal open={modalOpen} title={form.id ? "Edit Penjualan" : "Tambah Penjualan"} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Produk<select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className={inputClass}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Periode<input type="month" value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Jumlah Terjual<input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Channel<select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })} className={inputClass}><option>Retail</option><option>Distributor</option><option>HoReCa</option></select></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Simpan Penjualan</button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus data penjualan?"
        description="Data ini akan dihapus dari histori penjualan demo."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRecord("monthlySales", deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
