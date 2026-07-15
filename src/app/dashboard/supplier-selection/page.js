"use client";

import { useMemo, useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { calculateWeightedProduct, defaultWeightedProductCriteria } from "@/lib/services/weighted-product";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function SupplierSelectionPage() {
  const { rawMaterials, suppliers, supplierOffers, procurementRows } = useScm();
  const firstRequiredMaterial = procurementRows.find((row) => Number(row.netRequirement || 0) > 0)?.rawMaterialId;
  const [rawMaterialId, setRawMaterialId] = useState(firstRequiredMaterial || rawMaterials[0]?.id || "");
  const rawMaterial = rawMaterials.find((item) => item.id === rawMaterialId);
  const procurementRow = procurementRows.find((row) => row.rawMaterialId === rawMaterialId);
  const requiredQuantity = Number(procurementRow?.netRequirement || 0);
  const offers = useMemo(
    () => supplierOffers.filter((offer) => offer.rawMaterialId === rawMaterialId),
    [rawMaterialId, supplierOffers]
  );
  const currentResult = calculateWeightedProduct({
    offers,
    suppliers,
    requiredQuantity,
    criteria: defaultWeightedProductCriteria,
  });

  return (
    <div>
      <PageHeader
        title="Pemilihan Supplier"
        description="Weighted Product menghitung ranking supplier otomatis dari kebutuhan pembelian saat ini. Metode ini bukan machine learning dan tidak memakai rotasi supplier."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-gray-700 md:col-span-2">
                Bahan Baku
                <select value={rawMaterialId} onChange={(event) => setRawMaterialId(event.target.value)} className={inputClass}>
                  {rawMaterials.map((material) => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </label>
              <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-500">Kebutuhan Pembelian</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {formatNumber(requiredQuantity, { maximumFractionDigits: 2 })} {rawMaterial?.inventoryUnit}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Bobot Kriteria Standar</h2>
              <StatusBadge status="Otomatis" />
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {defaultWeightedProductCriteria.map((criterion) => (
                <div key={criterion.key} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  <p className="text-sm font-semibold text-gray-900">{criterion.label}</p>
                  <p className="mt-1 text-sm text-gray-600">{formatNumber(criterion.weight, { maximumFractionDigits: 2 })}</p>
                  <p className="mt-1 text-xs text-gray-500">{criterion.type === "cost" ? "Cost" : "Benefit"}</p>
                </div>
              ))}
            </div>
          </div>

          <DataTableWrapper empty={offers.length === 0}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Harga</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Kualitas</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Kapasitas</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Jarak</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Minimal Order</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Lead Time</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Kelayakan</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Nilai S</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Nilai V</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {currentResult.candidates.map((candidate) => (
                  <tr key={candidate.id} className={candidate.rank === 1 ? "bg-green-50/60" : "hover:bg-gray-50"}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{candidate.supplierName}</p>
                      <p className="text-xs text-gray-500">{candidate.eligibilityReason}</p>
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(candidate.price)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(candidate.qualityScore, { maximumFractionDigits: 1 })}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(candidate.capacity)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(candidate.distance)} km</td>
                    <td className="px-4 py-3 text-right">{formatNumber(candidate.minimumOrder)}</td>
                    <td className="px-4 py-3 text-right">{candidate.leadTime} hari</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={candidate.eligible ? "Layak" : "Tidak Layak"} /></td>
                    <td className="px-4 py-3 text-right">{candidate.vectorS ? formatNumber(candidate.vectorS, { maximumFractionDigits: 6 }) : "-"}</td>
                    <td className="px-4 py-3 text-right">{candidate.vectorV ? formatNumber(candidate.vectorV, { maximumFractionDigits: 6 }) : "-"}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-900">{candidate.rank || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableWrapper>
        </section>

        <aside className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Supplier Terpilih</h2>
          {currentResult.selected ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-700">Peringkat 1</p>
                <p className="mt-1 text-lg font-semibold text-green-900">{currentResult.selected.supplierName}</p>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-gray-500">Nilai S</dt><dd className="font-semibold text-gray-900">{formatNumber(currentResult.selected.vectorS, { maximumFractionDigits: 6 })}</dd></div>
                <div><dt className="text-gray-500">Nilai V</dt><dd className="font-semibold text-gray-900">{formatNumber(currentResult.selected.vectorV, { maximumFractionDigits: 6 })}</dd></div>
                <div><dt className="text-gray-500">Kebutuhan Bersih</dt><dd className="font-semibold text-gray-900">{formatNumber(requiredQuantity, { maximumFractionDigits: 2 })} {rawMaterial?.inventoryUnit}</dd></div>
                <div><dt className="text-gray-500">Jumlah Beli</dt><dd className="font-semibold text-gray-900">{formatNumber(currentResult.selected.finalOrderQuantity, { maximumFractionDigits: 2 })} {currentResult.selected.unit}</dd></div>
              </dl>
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-700">{currentResult.reason}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">{currentResult.error || currentResult.reason}</p>
          )}
          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
            Minimal order hanya dipakai untuk menentukan jumlah pembelian akhir, bukan untuk rotasi supplier.
          </div>
        </aside>
      </div>
    </div>
  );
}
