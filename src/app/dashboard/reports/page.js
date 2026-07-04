"use client";

import { Download, Printer } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatCurrency, formatDate, formatNumber, formatPeriod, stockStatus } from "@/lib/utils/format";

const tabs = ["Penjualan", "Peramalan", "Persediaan", "Pemilihan Supplier", "Pengadaan", "Produksi", "Distribusi"];
const inputClass = "h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ReportsPage() {
  const scm = useScm();
  const [activeTab, setActiveTab] = useState("Penjualan");
  const [productId, setProductId] = useState("Semua");
  const [supplierId, setSupplierId] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [period, setPeriod] = useState("Semua");
  const periods = useMemo(
    () => ["Semua", ...new Set([...scm.monthlySales.map((sale) => sale.period), ...scm.forecasts.map((forecast) => forecast.period)].sort())],
    [scm.forecasts, scm.monthlySales]
  );

  const salesRows = scm.monthlySales
    .filter((sale) => productId === "Semua" || sale.productId === productId)
    .filter((sale) => period === "Semua" || sale.period === period)
    .map((sale) => ({ ...sale, productName: scm.products.find((product) => product.id === sale.productId)?.name || "-" }));
  const forecastRows = scm.forecasts
    .filter((forecast) => productId === "Semua" || forecast.productId === productId)
    .filter((forecast) => status === "Semua" || forecast.status === status)
    .map((forecast) => ({ ...forecast, productName: scm.products.find((product) => product.id === forecast.productId)?.name || "-" }));
  const inventoryRows = scm.inventories.map((inventory) => {
    const item = inventory.itemType === "raw-material"
      ? scm.rawMaterials.find((material) => material.id === inventory.rawMaterialId)
      : scm.products.find((product) => product.id === inventory.productId);
    return { ...inventory, itemName: item?.name || "-", itemCode: item?.code || "-", status: stockStatus(inventory.currentStock, inventory.safetyStock) };
  }).filter((row) => status === "Semua" || row.status === status);
  const offerRows = scm.supplierOffers
    .filter((offer) => supplierId === "Semua" || offer.supplierId === supplierId)
    .map((offer) => ({
      ...offer,
      supplierName: scm.suppliers.find((supplier) => supplier.id === offer.supplierId)?.name || "-",
      rawMaterialName: scm.rawMaterials.find((material) => material.id === offer.rawMaterialId)?.name || "-",
    }));
  const procurementRows = scm.procurementPlans.filter((plan) => status === "Semua" || plan.status === status);
  const productionRows = scm.productionOrders.filter((order) => status === "Semua" || order.status === status);
  const distributionRows = scm.distributions.filter((distribution) => status === "Semua" || distribution.status === status);

  const chartData = useMemo(() => {
    if (activeTab === "Penjualan") {
      return salesRows.reduce((result, sale) => {
        const existing = result.find((item) => item.period === sale.period);
        if (existing) {
          existing.total += Number(sale.quantity || 0);
          return result;
        }
        return [...result, { period: sale.period, label: formatPeriod(sale.period).slice(0, 3), total: Number(sale.quantity || 0) }];
      }, []);
    }

    if (activeTab === "Persediaan") {
      return inventoryRows.slice(0, 10).map((row) => ({ label: row.itemName.slice(0, 12), total: Number(row.currentStock || 0) }));
    }

    if (activeTab === "Pengadaan") {
      return procurementRows.map((row) => ({ label: row.rawMaterialName.slice(0, 12), total: Number(row.finalOrderQuantity || 0) }));
    }

    if (activeTab === "Produksi") {
      return productionRows.map((row) => ({ label: row.number, total: Number(row.actualGoodQuantity || row.targetQuantity || 0) }));
    }

    if (activeTab === "Distribusi") {
      return distributionRows.map((row) => ({ label: row.deliveryNoteNumber, total: Number(row.quantity || 0) }));
    }

    return offerRows.slice(0, 10).map((row) => ({ label: row.supplierName.slice(0, 12), total: Number(row.price || row.capacity || 0) }));
  }, [activeTab, distributionRows, inventoryRows, offerRows, procurementRows, productionRows, salesRows]);

  const summary = {
    Penjualan: [
      ["Total Unit", `${formatNumber(salesRows.reduce((total, sale) => total + sale.quantity, 0))} pcs`],
      ["Jumlah Record", salesRows.length],
      ["Produk Aktif", scm.products.length],
    ],
    Peramalan: [
      ["Total Forecast", forecastRows.length],
      ["Disetujui", forecastRows.filter((row) => row.status === "Disetujui").length],
      ["Metode", "Regresi Linier"],
    ],
    Persediaan: [
      ["Item Inventory", inventoryRows.length],
      ["Menipis", inventoryRows.filter((row) => row.status === "Menipis").length],
      ["Habis", inventoryRows.filter((row) => row.status === "Habis").length],
    ],
    "Pemilihan Supplier": [
      ["Offer Supplier", offerRows.length],
      ["Supplier", scm.suppliers.length],
      ["Bahan Baku", scm.rawMaterials.length],
    ],
    Pengadaan: [
      ["Rencana", procurementRows.length],
      ["Total Estimasi", formatCurrency(procurementRows.reduce((total, row) => total + row.finalOrderQuantity * row.unitPrice, 0))],
      ["PO Dibuat", procurementRows.filter((row) => row.status === "PO Dibuat").length],
    ],
    Produksi: [
      ["Order Produksi", productionRows.length],
      ["Selesai", productionRows.filter((row) => row.status === "Selesai").length],
      ["Berhasil", `${formatNumber(productionRows.reduce((total, row) => total + row.actualGoodQuantity, 0))} pcs`],
    ],
    Distribusi: [
      ["Pengiriman", distributionRows.length],
      ["Dikirim", distributionRows.filter((row) => row.status === "Dikirim").length],
      ["Diterima", distributionRows.filter((row) => row.status === "Diterima").length],
    ],
  }[activeTab];

  function exportReport() {
    scm.pushToast(`Export laporan ${activeTab} disimulasikan. Tidak ada file Excel/PDF dibuat pada prototype ini.`, "info");
  }

  return (
    <div>
      <PageHeader
        title="Laporan"
        description="Laporan ringkas lintas modul dengan filter periode, produk, supplier, status, grafik, tabel, dan tampilan cetak."
        actions={
          <>
            <button type="button" onClick={exportReport} className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Printer className="h-4 w-4" aria-hidden="true" />
              Cetak
            </button>
          </>
        }
      />

      <div className="print-hidden mb-4 flex gap-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold ${activeTab === tab ? "bg-blue-600 text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
            {tab}
          </button>
        ))}
      </div>

      <section className="print-hidden mb-6 grid gap-3 md:grid-cols-4">
        <select value={period} onChange={(event) => setPeriod(event.target.value)} className={inputClass}>
          {periods.map((item) => <option key={item} value={item}>{item === "Semua" ? "Semua Periode" : formatPeriod(item)}</option>)}
        </select>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}>
          <option value="Semua">Semua Produk</option>
          {scm.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </select>
        <select value={supplierId} onChange={(event) => setSupplierId(event.target.value)} className={inputClass}>
          <option value="Semua">Semua Supplier</option>
          {scm.suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
          <option>Semua</option>
          <option>Disetujui</option>
          <option>Direncanakan</option>
          <option>PO Dibuat</option>
          <option>Diproses</option>
          <option>Selesai</option>
          <option>Dikirim</option>
          <option>Diterima</option>
          <option>Menipis</option>
          <option>Habis</option>
        </select>
      </section>

      <div className="grid gap-3 md:grid-cols-3">
        {summary.map(([title, value]) => <StatCard key={title} title={title} value={value} />)}
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Grafik {activeTab}</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "Penjualan" ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-6">
        {activeTab === "Penjualan" ? (
          <DataTableWrapper empty={salesRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Produk</th><th className="px-4 py-3 text-left">Periode</th><th className="px-4 py-3 text-left">Channel</th><th className="px-4 py-3 text-right">Qty</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{salesRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.productName}</td><td className="px-4 py-3">{formatPeriod(row.period)}</td><td className="px-4 py-3">{row.channel}</td><td className="px-4 py-3 text-right">{formatNumber(row.quantity)}</td></tr>)}</tbody></table></DataTableWrapper>
        ) : activeTab === "Peramalan" ? (
          <DataTableWrapper empty={forecastRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Produk</th><th className="px-4 py-3 text-left">Periode</th><th className="px-4 py-3 text-right">Prediksi</th><th className="px-4 py-3 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{forecastRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.productName}</td><td className="px-4 py-3">{formatPeriod(row.period)}</td><td className="px-4 py-3 text-right">{formatNumber(row.predictedQuantity || row.quantity)}</td><td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td></tr>)}</tbody></table></DataTableWrapper>
        ) : activeTab === "Persediaan" ? (
          <DataTableWrapper empty={inventoryRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Item</th><th className="px-4 py-3 text-right">Stok</th><th className="px-4 py-3 text-right">Safety</th><th className="px-4 py-3 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{inventoryRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.itemName}</td><td className="px-4 py-3 text-right">{formatNumber(row.currentStock)}</td><td className="px-4 py-3 text-right">{formatNumber(row.safetyStock)}</td><td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td></tr>)}</tbody></table></DataTableWrapper>
        ) : activeTab === "Pemilihan Supplier" ? (
          <DataTableWrapper empty={offerRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Supplier</th><th className="px-4 py-3 text-left">Bahan</th><th className="px-4 py-3 text-right">Harga</th><th className="px-4 py-3 text-right">Kapasitas</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{offerRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.supplierName}</td><td className="px-4 py-3">{row.rawMaterialName}</td><td className="px-4 py-3 text-right">{formatCurrency(row.price)}</td><td className="px-4 py-3 text-right">{formatNumber(row.capacity)}</td></tr>)}</tbody></table></DataTableWrapper>
        ) : activeTab === "Pengadaan" ? (
          <DataTableWrapper empty={procurementRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Bahan</th><th className="px-4 py-3 text-left">Supplier</th><th className="px-4 py-3 text-right">Qty Beli</th><th className="px-4 py-3 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{procurementRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.rawMaterialName}</td><td className="px-4 py-3">{row.selectedSupplierName}</td><td className="px-4 py-3 text-right">{formatNumber(row.finalOrderQuantity)}</td><td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td></tr>)}</tbody></table></DataTableWrapper>
        ) : activeTab === "Produksi" ? (
          <DataTableWrapper empty={productionRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Order</th><th className="px-4 py-3 text-left">Tanggal</th><th className="px-4 py-3 text-right">Target</th><th className="px-4 py-3 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{productionRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.number}</td><td className="px-4 py-3">{formatDate(row.scheduledDate)}</td><td className="px-4 py-3 text-right">{formatNumber(row.targetQuantity)}</td><td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td></tr>)}</tbody></table></DataTableWrapper>
        ) : (
          <DataTableWrapper empty={distributionRows.length === 0}><table className="min-w-full divide-y divide-gray-200 text-sm"><thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left">Surat Jalan</th><th className="px-4 py-3 text-left">Tanggal</th><th className="px-4 py-3 text-right">Qty</th><th className="px-4 py-3 text-center">Status</th></tr></thead><tbody className="divide-y divide-gray-100 bg-white">{distributionRows.map((row) => <tr key={row.id}><td className="px-4 py-3">{row.deliveryNoteNumber}</td><td className="px-4 py-3">{formatDate(row.shipmentDate)}</td><td className="px-4 py-3 text-right">{formatNumber(row.quantity)}</td><td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td></tr>)}</tbody></table></DataTableWrapper>
        )}
      </section>
    </div>
  );
}
