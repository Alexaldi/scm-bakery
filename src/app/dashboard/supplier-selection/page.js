"use client";

import { Calculator } from "lucide-react";
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
  const { rawMaterials, suppliers, supplierOffers, pushToast } = useScm();
  const [rawMaterialId, setRawMaterialId] = useState(rawMaterials[0]?.id || "");
  const [requiredQuantity, setRequiredQuantity] = useState(120);
  const [criteria, setCriteria] = useState(defaultWeightedProductCriteria);
  const [result, setResult] = useState(null);
  const rawMaterial = rawMaterials.find((item) => item.id === rawMaterialId);
  const offers = useMemo(
    () => supplierOffers.filter((offer) => offer.rawMaterialId === rawMaterialId),
    [rawMaterialId, supplierOffers]
  );
  const currentResult =
    result ||
    calculateWeightedProduct({
      offers,
      suppliers,
      requiredQuantity,
      criteria,
    });

  function updateWeight(key, value) {
    setCriteria((current) =>
      current.map((criterion) =>
        criterion.key === key ? { ...criterion, weight: Number(value || 0) } : criterion
      )
    );
    setResult(null);
  }

  function runSelection() {
    const calculation = calculateWeightedProduct({
      offers,
      suppliers,
      requiredQuantity,
      criteria,
    });
    setResult(calculation);
    pushToast(calculation.isValid ? "Pemilihan supplier berhasil dihitung." : calculation.error, calculation.isValid ? "success" : "error");
  }

  return (
    <div>
      <PageHeader
        title="Pemilihan Supplier"
        description="Weighted Product bukan machine learning. Metode ini adalah multi-criteria decision-making; supplier dipilih berdasarkan kebutuhan pembelian saat ini tanpa forced rotation."
        actions={
          <button type="button" onClick={runSelection} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Hitung Ranking WP
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <section className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-700">
                Bahan Baku
                <select value={rawMaterialId} onChange={(event) => { setRawMaterialId(event.target.value); setResult(null); }} className={inputClass}>
                  {rawMaterials.map((material) => (
                    <option key={material.id} value={material.id}>{material.name}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                Kebutuhan Pembelian ({rawMaterial?.inventoryUnit})
                <input type="number" value={requiredQuantity} onChange={(event) => { setRequiredQuantity(event.target.value); setResult(null); }} className={inputClass} />
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Konfigurasi Bobot Kriteria</h2>
              <StatusBadge status={`Total ${formatNumber(currentResult.totalWeight || 0, { maximumFractionDigits: 2 })}`} />
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {criteria.map((criterion) => (
                <label key={criterion.key} className="text-sm font-medium text-gray-700">
                  {criterion.label}
                  <input type="number" min="0" max="1" step="0.01" value={criterion.weight} onChange={(event) => updateWeight(criterion.key, event.target.value)} className={inputClass} />
                  <span className="mt-1 block text-xs text-gray-500">{criterion.type === "cost" ? "Cost" : "Benefit"}</span>
                </label>
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
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Min. Order</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Lead Time</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Eligibility</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">S</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">V</th>
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
                <div><dt className="text-gray-500">Net Requirement</dt><dd className="font-semibold text-gray-900">{formatNumber(requiredQuantity)} {rawMaterial?.inventoryUnit}</dd></div>
                <div><dt className="text-gray-500">Final Order</dt><dd className="font-semibold text-gray-900">{formatNumber(currentResult.selected.finalOrderQuantity)} {currentResult.selected.unit}</dd></div>
              </dl>
              <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm leading-6 text-gray-700">{currentResult.reason}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">{currentResult.error || currentResult.reason}</p>
          )}
          <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-600">
            Minimum order tidak digunakan sebagai kriteria rotasi. Minimum order hanya menentukan final order quantity:
            maksimum dari net requirement dan minimum order supplier.
          </div>
        </aside>
      </div>
    </div>
  );
}
