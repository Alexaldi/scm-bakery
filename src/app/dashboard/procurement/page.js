"use client";

import { Plus } from "lucide-react";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

export default function ProcurementPage() {
  const { procurementRows, procurementPlans, createProcurementPlans } = useScm();

  function createPlans() {
    createProcurementPlans(procurementRows);
  }

  return (
    <div>
      <PageHeader
        title="Pengadaan"
        description="Rencana pengadaan siap pakai dari peramalan, kebutuhan bahan, stok gudang, safety stock, dan supplier terpilih otomatis."
        actions={
          <button type="button" onClick={createPlans} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Buat Rencana Pengadaan
          </button>
        }
      />

      <DataTableWrapper empty={procurementRows.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Bahan Baku</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Kebutuhan Bahan</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Stok Awal</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Safety Stock</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Minimal Pembelian</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Jumlah Barang yang Harus Dibeli</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Kebutuhan Bersih</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {procurementRows.map((row) => (
              <tr key={row.rawMaterialId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{row.rawMaterialName}</p>
                  <p className="text-xs text-gray-500">Total kebutuhan {formatNumber(row.grossRequirement, { maximumFractionDigits: 2 })} {row.inventoryUnit}</p>
                </td>
                <td className="px-4 py-3 text-right">{formatNumber(row.forecastResult, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.currentStock, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.safetyStock, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{row.selectedSupplierName}</p>
                  <p className="text-xs text-gray-500">{row.selection?.reason}</p>
                </td>
                <td className="px-4 py-3 text-right">{formatNumber(row.minimumOrder, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(row.finalOrderQuantity, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                <td className="px-4 py-3 text-right">{formatNumber(row.netRequirement, { maximumFractionDigits: 2 })}</td>
                <td className="px-4 py-3 text-center"><StatusBadge status={row.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableWrapper>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Rencana Pengadaan Tersimpan</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {procurementPlans.slice(0, 8).map((plan) => (
            <div key={plan.id} className="grid gap-2 px-5 py-4 text-sm md:grid-cols-[1fr_12rem_12rem_8rem] md:items-center">
              <div>
                <p className="font-medium text-gray-900">{plan.rawMaterialName}</p>
                <p className="text-gray-500">{plan.selectedSupplierName} - {formatCurrency(plan.unitPrice)} / {plan.inventoryUnit}</p>
              </div>
              <p className="font-semibold text-gray-900">{formatNumber(plan.finalOrderQuantity, { maximumFractionDigits: 2 })} {plan.inventoryUnit}</p>
              <p className="text-gray-600">Bersih {formatNumber(plan.netRequirement, { maximumFractionDigits: 2 })}</p>
              <StatusBadge status={plan.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
