"use client";

import { PackageCheck } from "lucide-react";
import { useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatDate, formatNumber } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ReceivingPage() {
  const { purchaseOrders, receivingRecords, rawMaterials, confirmReceiving, pushToast } = useScm();
  const receivablePos = purchaseOrders.filter((po) => !["Selesai", "Dibatalkan"].includes(po.status));
  const [purchaseOrderId, setPurchaseOrderId] = useState(receivablePos[0]?.id || "");
  const selectedPo = purchaseOrders.find((po) => po.id === purchaseOrderId);
  const firstItem = selectedPo?.items[0];
  const [rawMaterialId, setRawMaterialId] = useState(firstItem?.rawMaterialId || "");
  const [form, setForm] = useState({
    deliveryOrderNumber: "DO-DEMO-001",
    receivedDate: "2026-07-03",
    receivedQuantity: 0,
    rejectedQuantity: 0,
    qualityResult: "Baik",
    notes: "Penerimaan bahan simulasi",
  });

  const activeRawMaterialId = selectedPo?.items.some((item) => item.rawMaterialId === rawMaterialId)
    ? rawMaterialId
    : firstItem?.rawMaterialId || "";
  const poItem = selectedPo?.items.find((item) => item.rawMaterialId === activeRawMaterialId) || firstItem;
  const priorReceived = receivingRecords
    .filter((record) => record.purchaseOrderId === purchaseOrderId && record.rawMaterialId === activeRawMaterialId)
    .reduce((total, record) => total + Number(record.receivedQuantity || 0), 0);
  const remaining = Math.max(0, Number(poItem?.quantity || 0) - priorReceived);

  function submitReceiving(event) {
    event.preventDefault();
    if (!selectedPo || !poItem) {
      pushToast("Pilih Purchase Order terlebih dahulu.", "error");
      return;
    }

    confirmReceiving({
      ...form,
      purchaseOrderId,
      poNumber: selectedPo.number,
      rawMaterialId: activeRawMaterialId,
      orderedQuantity: poItem.quantity,
      unit: poItem.unit,
    });
    setForm({
      ...form,
      deliveryOrderNumber: `DO-DEMO-${String(receivingRecords.length + 2).padStart(3, "0")}`,
      receivedQuantity: 0,
      rejectedQuantity: 0,
    });
  }

  return (
    <div>
      <PageHeader
        title="Penerimaan Bahan"
        description="Simulasi penerimaan bahan dari Purchase Order, termasuk penerimaan parsial, reject, hasil kualitas, dan update stok otomatis."
      />

      <div className="grid gap-6 xl:grid-cols-[24rem_1fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-md bg-blue-50 p-2 text-blue-700"><PackageCheck className="h-5 w-5" aria-hidden="true" /></span>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Form Penerimaan</h2>
              <p className="text-sm text-gray-500">Qty diterima menambah stok bahan baku.</p>
            </div>
          </div>
          <form onSubmit={submitReceiving} className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Purchase Order<select value={purchaseOrderId} onChange={(event) => setPurchaseOrderId(event.target.value)} className={inputClass}><option value="">Pilih PO</option>{receivablePos.map((po) => <option key={po.id} value={po.id}>{po.number} - {po.supplierName}</option>)}</select></label>
            <label className="text-sm font-medium text-gray-700">Bahan<select value={activeRawMaterialId} onChange={(event) => setRawMaterialId(event.target.value)} className={inputClass}>{selectedPo?.items.map((item) => <option key={item.id} value={item.rawMaterialId}>{item.rawMaterialName}</option>)}</select></label>
            <div className="grid grid-cols-2 gap-3 rounded-md bg-gray-50 p-3 text-sm">
              <div><p className="text-gray-500">Ordered</p><p className="font-semibold text-gray-900">{formatNumber(poItem?.quantity || 0, { maximumFractionDigits: 2 })} {poItem?.unit}</p></div>
              <div><p className="text-gray-500">Sisa</p><p className="font-semibold text-gray-900">{formatNumber(remaining, { maximumFractionDigits: 2 })} {poItem?.unit}</p></div>
            </div>
            <label className="text-sm font-medium text-gray-700">Nomor Delivery Order<input value={form.deliveryOrderNumber} onChange={(event) => setForm({ ...form, deliveryOrderNumber: event.target.value })} className={inputClass} required /></label>
            <label className="text-sm font-medium text-gray-700">Tanggal Terima<input type="date" value={form.receivedDate} onChange={(event) => setForm({ ...form, receivedDate: event.target.value })} className={inputClass} required /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm font-medium text-gray-700">Qty Diterima<input type="number" step="0.01" value={form.receivedQuantity} onChange={(event) => setForm({ ...form, receivedQuantity: event.target.value })} className={inputClass} required /></label>
              <label className="text-sm font-medium text-gray-700">Qty Reject<input type="number" step="0.01" value={form.rejectedQuantity} onChange={(event) => setForm({ ...form, rejectedQuantity: event.target.value })} className={inputClass} /></label>
            </div>
            <label className="text-sm font-medium text-gray-700">Hasil Kualitas<select value={form.qualityResult} onChange={(event) => setForm({ ...form, qualityResult: event.target.value })} className={inputClass}><option>Baik</option><option>Perlu Sortir</option><option>Ditolak</option></select></label>
            <label className="text-sm font-medium text-gray-700">Catatan<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={inputClass} /></label>
            <button type="submit" className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Konfirmasi Penerimaan</button>
          </form>
        </section>

        <section>
          <DataTableWrapper empty={receivingRecords.length === 0}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">PO / DO</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Bahan</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Ordered</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Diterima</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Reject</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Kualitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {receivingRecords.map((record) => {
                  const material = rawMaterials.find((item) => item.id === record.rawMaterialId);
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3"><p className="font-medium text-gray-900">{record.poNumber}</p><p className="text-xs text-gray-500">{record.deliveryOrderNumber}</p></td>
                      <td className="px-4 py-3 text-gray-700">{material?.name || "-"}</td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(record.receivedDate)}</td>
                      <td className="px-4 py-3 text-right">{formatNumber(record.orderedQuantity, { maximumFractionDigits: 2 })} {record.unit}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{formatNumber(record.receivedQuantity, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right text-red-700">{formatNumber(record.rejectedQuantity, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center"><StatusBadge status={record.qualityResult} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </DataTableWrapper>
        </section>
      </div>
    </div>
  );
}
