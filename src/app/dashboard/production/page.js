"use client";

import { CheckCircle2, Factory, Plus, Play } from "lucide-react";
import { useMemo, useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatDate, formatNumber, formatPeriod } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProductionPage() {
  const {
    products,
    forecasts,
    productionOrders,
    validateProductionMaterials,
    saveProductionOrder,
    updateProductionStatus,
    completeProduction,
  } = useScm();
  const approvedForecasts = forecasts.filter((forecast) => forecast.status === "Disetujui");
  const [selectedId, setSelectedId] = useState(productionOrders[0]?.id || "");
  const selectedOrder = productionOrders.find((order) => order.id === selectedId) || productionOrders[0];
  const selectedProduct = products.find((product) => product.id === selectedOrder?.productId);
  const validation = useMemo(
    () => validateProductionMaterials(selectedOrder?.productId, selectedOrder?.targetQuantity),
    [selectedOrder, validateProductionMaterials]
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [form, setForm] = useState({
    productId: products[0]?.id || "",
    forecastId: approvedForecasts[0]?.id || "",
    targetQuantity: 100,
    scheduledDate: "2026-07-05",
    notes: "Order produksi simulasi",
  });
  const [completeForm, setCompleteForm] = useState({ actualGoodQuantity: selectedOrder?.targetQuantity || 0, failedQuantity: 0 });

  function submitCreate(event) {
    event.preventDefault();
    saveProductionOrder(form);
    setCreateOpen(false);
  }

  function submitComplete(event) {
    event.preventDefault();
    completeProduction(selectedOrder.id, completeForm.actualGoodQuantity, completeForm.failedQuantity);
    setCompleteOpen(false);
  }

  function changeForecast(forecastId) {
    const forecast = forecasts.find((item) => item.id === forecastId);
    setForm({
      ...form,
      forecastId,
      productId: forecast?.productId || form.productId,
      targetQuantity: forecast?.quantity || form.targetQuantity,
    });
  }

  return (
    <div>
      <PageHeader
        title="Produksi"
        description="Simulasi order produksi memvalidasi kecukupan bahan dari BOM sebelum diproses. Saat selesai, bahan baku berkurang dan stok produk jadi bertambah."
        actions={
          <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Order Produksi
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_28rem]">
        <DataTableWrapper empty={productionOrders.length === 0}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Order</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Target</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Berhasil</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Gagal</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {productionOrders.map((order) => {
                const product = products.find((item) => item.id === order.productId);
                return (
                  <tr key={order.id} className={selectedOrder?.id === order.id ? "bg-blue-50/60" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3"><button type="button" onClick={() => setSelectedId(order.id)} className="font-medium text-blue-700 hover:text-blue-800">{order.number}</button></td>
                    <td className="px-4 py-3 text-gray-700">{product?.name}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(order.targetQuantity)} pcs</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(order.scheduledDate)}</td>
                    <td className="px-4 py-3 text-right text-green-700">{formatNumber(order.actualGoodQuantity)}</td>
                    <td className="px-4 py-3 text-right text-red-700">{formatNumber(order.failedQuantity)}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => updateProductionStatus(order.id, "Bahan Disiapkan")} className="rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Siapkan</button>
                        <button type="button" onClick={() => updateProductionStatus(order.id, "Diproses")} className="rounded-md border border-blue-200 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">Mulai</button>
                        <button type="button" onClick={() => { setSelectedId(order.id); setCompleteForm({ actualGoodQuantity: order.targetQuantity, failedQuantity: 0 }); setCompleteOpen(true); }} className="rounded-md border border-green-200 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">Selesai</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableWrapper>

        <aside className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <span className="rounded-md bg-blue-50 p-2 text-blue-700"><Factory className="h-5 w-5" aria-hidden="true" /></span>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selectedOrder?.number || "Material Availability"}</h2>
                <p className="text-sm text-gray-500">{selectedProduct?.name}</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {validation.map((item) => (
              <div key={item.rawMaterialId} className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-gray-900">{item.rawMaterialName}</p>
                  <StatusBadge status={item.sufficient ? "Cukup" : "Kurang"} />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Butuh {formatNumber(item.requiredQuantity, { maximumFractionDigits: 2 })} {item.inventoryUnit}; tersedia {formatNumber(item.availableStock, { maximumFractionDigits: 2 })} {item.inventoryUnit}
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <FormModal open={createOpen} title="Buat Order Produksi" onClose={() => setCreateOpen(false)}>
        <form onSubmit={submitCreate} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Sumber Forecast<select value={form.forecastId} onChange={(event) => changeForecast(event.target.value)} className={inputClass}><option value="">Tanpa forecast</option>{approvedForecasts.map((forecast) => { const product = products.find((item) => item.id === forecast.productId); return <option key={forecast.id} value={forecast.id}>{product?.name} - {formatPeriod(forecast.period)}</option>; })}</select></label>
          <label className="text-sm font-medium text-gray-700">Produk<select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className={inputClass}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Target Quantity<input type="number" value={form.targetQuantity} onChange={(event) => setForm({ ...form, targetQuantity: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Tanggal Produksi<input type="date" value={form.scheduledDate} onChange={(event) => setForm({ ...form, scheduledDate: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Catatan<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={inputClass} /></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><Play className="h-4 w-4" aria-hidden="true" />Simpan Order</button>
          </div>
        </form>
      </FormModal>

      <FormModal open={completeOpen} title="Selesaikan Produksi" onClose={() => setCompleteOpen(false)}>
        <form onSubmit={submitComplete} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Qty Berhasil<input type="number" value={completeForm.actualGoodQuantity} onChange={(event) => setCompleteForm({ ...completeForm, actualGoodQuantity: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Qty Gagal<input type="number" value={completeForm.failedQuantity} onChange={(event) => setCompleteForm({ ...completeForm, failedQuantity: event.target.value })} className={inputClass} /></label>
          <div className="md:col-span-2 rounded-md bg-amber-50 p-3 text-sm text-amber-800">Menyelesaikan produksi akan mengurangi stok bahan baku sesuai BOM dan menambah stok produk jadi sebanyak qty berhasil.</div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCompleteOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Konfirmasi Selesai</button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
