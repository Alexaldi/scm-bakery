"use client";

import { Eye, FileText, Plus, Printer } from "lucide-react";
import { useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils/format";

const statuses = ["Draft", "Diajukan", "Disetujui", "Dikirim", "Diterima Sebagian", "Selesai", "Dibatalkan"];

export default function PurchaseOrdersPage() {
  const {
    purchaseOrders,
    procurementPlans,
    createPurchaseOrderFromPlan,
    updatePurchaseOrderStatus,
    poTotals,
    pushToast,
  } = useScm();
  const availablePlans = procurementPlans.filter((plan) => !plan.purchaseOrderId && Number(plan.finalOrderQuantity || 0) > 0);
  const [planId, setPlanId] = useState(availablePlans[0]?.id || "");
  const [detailPo, setDetailPo] = useState(null);

  function createPo() {
    if (!planId) {
      pushToast("Pilih rencana pengadaan terlebih dahulu.", "error");
      return;
    }

    createPurchaseOrderFromPlan(planId);
    setPlanId("");
  }

  return (
    <div>
      <PageHeader
        title="Purchase Order"
        description="Daftar Purchase Order simulasi, konversi dari rencana pengadaan, status PO, dan tampilan detail cetak."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <select value={planId} onChange={(event) => setPlanId(event.target.value)} className="h-10 rounded-md border border-gray-300 px-3 text-sm">
              <option value="">Pilih rencana pengadaan</option>
              {availablePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.rawMaterialName} - {plan.selectedSupplierName}</option>
              ))}
            </select>
            <button type="button" onClick={createPo} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Buat PO
            </button>
          </div>
        }
      />

      <DataTableWrapper empty={purchaseOrders.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nomor PO</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal Order</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Estimasi Datang</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Item</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Total</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {purchaseOrders.map((po) => (
              <tr key={po.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{po.number}</td>
                <td className="px-4 py-3 text-gray-700">{po.supplierName}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(po.orderDate)}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(po.expectedArrivalDate)}</td>
                <td className="px-4 py-3 text-right">{po.items.length}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(poTotals[po.id])}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={po.status} /></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <select value={po.status} onChange={(event) => updatePurchaseOrderStatus(po.id, event.target.value)} className="h-9 rounded-md border border-gray-300 px-2 text-xs">
                      {statuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button type="button" onClick={() => setDetailPo(po)} className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Detail PO">
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableWrapper>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-blue-50 p-2 text-blue-700"><FileText className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Alur Status PO</h2>
            <p className="mt-1 text-sm text-gray-600">Draft → Diajukan → Disetujui → Dikirim → Diterima Sebagian → Selesai. Status dapat diubah untuk simulasi proses persetujuan.</p>
          </div>
        </div>
      </section>

      <FormModal open={Boolean(detailPo)} title="Detail Purchase Order" onClose={() => setDetailPo(null)} size="max-w-3xl">
        {detailPo ? (
          <div>
            <div className="print:hidden mb-4 flex justify-end">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Printer className="h-4 w-4" aria-hidden="true" />
                Cetak
              </button>
            </div>
            <div className="rounded-lg border border-gray-200 p-5">
              <div className="flex flex-col justify-between gap-4 sm:flex-row">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">SCM Bakery</h2>
                  <p className="text-sm text-gray-500">Purchase Order Simulasi</p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold text-gray-900">{detailPo.number}</p>
                  <p className="text-gray-500">{formatDate(detailPo.orderDate)}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-500">Supplier</p>
                  <p className="font-semibold text-gray-900">{detailPo.supplierName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estimasi Kedatangan</p>
                  <p className="font-semibold text-gray-900">{formatDate(detailPo.expectedArrivalDate)}</p>
                </div>
              </div>
              <table className="mt-6 min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Bahan</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Qty</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Harga</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detailPo.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2">{item.rawMaterialName}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(item.quantity, { maximumFractionDigits: 2 })} {item.unit}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-semibold text-gray-900">{formatCurrency(poTotals[detailPo.id])}</p>
              </div>
            </div>
          </div>
        ) : null}
      </FormModal>
    </div>
  );
}
