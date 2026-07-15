"use client";

import { Calculator } from "lucide-react";
import { useMemo, useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { calculateMaterialRequirements } from "@/lib/services/material-requirement";
import { formatNumber, formatPeriod } from "@/lib/utils/format";

export default function MaterialRequirementsPage() {
  const {
    forecasts,
    products,
    bom,
    rawMaterials,
    materialRequirements,
    calculateAndSaveMaterialRequirements,
  } = useScm();
  const [lastResult, setLastResult] = useState(null);
  const approvedForecasts = forecasts.filter((forecast) => forecast.status === "Disetujui");
  const preview = useMemo(
    () =>
      calculateMaterialRequirements({
        forecasts,
        products,
        bom,
        rawMaterials,
      }),
    [bom, forecasts, products, rawMaterials]
  );
  const result = lastResult || preview;

  function runCalculation() {
    const saved = calculateAndSaveMaterialRequirements();
    setLastResult(saved);
  }

  return (
    <div>
      <PageHeader
        title="Kebutuhan Bahan"
        description="Kebutuhan bahan dihitung otomatis dari hasil peramalan produksi dan Bill of Material."
        actions={
          <button type="button" onClick={runCalculation} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Calculator className="h-4 w-4" aria-hidden="true" />
            Perbarui Kebutuhan Bahan
          </button>
        }
      />

      <section className="mb-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Peramalan Disetujui</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {approvedForecasts.map((forecast) => {
            const product = products.find((item) => item.id === forecast.productId);
            return (
              <div key={forecast.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{product?.name}</p>
                  <p className="text-sm text-gray-500">{formatPeriod(forecast.period)} - {forecast.method}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-semibold text-gray-900">{formatNumber(forecast.quantity || forecast.predictedQuantity)} pcs</p>
                  <StatusBadge status={forecast.status} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">Kebutuhan per Produk</h2>
          <DataTableWrapper empty={result.detailedRows.length === 0}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Bahan</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Prediksi Produksi</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">BOM</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Konversi</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Kebutuhan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {result.detailedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{row.productName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.rawMaterialName}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.forecastQuantity)} pcs</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.quantityPerProduct)} {row.usageUnit}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.convertedQuantity, { maximumFractionDigits: 4 })} {row.inventoryUnit}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(row.grossRequirement, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableWrapper>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-gray-900">Agregasi Kebutuhan Bahan</h2>
          <DataTableWrapper empty={result.aggregated.length === 0}>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Bahan Baku</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Total Kebutuhan</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {result.aggregated.map((item) => (
                  <tr key={item.rawMaterialId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.rawMaterialName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(item.totalGrossRequirement, { maximumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-600">{item.inventoryUnit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTableWrapper>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-900">Ringkasan Kebutuhan Bahan</p>
            <p className="mt-1 text-sm text-blue-800">
              {result.aggregated.length} bahan baku tersedia untuk pengadaan. Data juga diperbarui otomatis setelah peramalan disimpan.
            </p>
          </div>
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-900">Data Kebutuhan Tersimpan</p>
            <p className="mt-1 text-sm text-gray-600">{materialRequirements.length} baris kebutuhan bahan saat ini tersedia untuk modul Pengadaan.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
