"use client";

import { Calculator, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { calculateLinearRegression } from "@/lib/services/linear-regression";
import { formatNumber, formatPeriod, getNextPeriod } from "@/lib/utils/format";

const inputClass =
  "h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ForecastsPage() {
  const { products, monthlySales, forecasts, saveForecast, pushToast } = useScm();
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [periodCount, setPeriodCount] = useState(12);
  const [result, setResult] = useState(null);

  const product = products.find((item) => item.id === productId);
  const productSales = useMemo(
    () =>
      monthlySales
        .filter((sale) => sale.productId === productId)
        .sort((a, b) => a.period.localeCompare(b.period))
        .slice(-Number(periodCount || 12)),
    [monthlySales, periodCount, productId]
  );
  const nextPeriod = getNextPeriod(productSales.at(-1)?.period || "2026-06");
  const chartData = productSales.map((sale, index) => ({
    x: index + 1,
    label: formatPeriod(sale.period).slice(0, 3),
    actual: Number(sale.quantity || 0),
    regression:
      result?.isValid && result.rows[index]
        ? Math.max(0, result.intercept + result.slope * (index + 1))
        : null,
  }));
  const forecastHistory = forecasts
    .filter((forecast) => forecast.productId === productId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  function runForecast() {
    const calculation = calculateLinearRegression(productSales.map((sale) => sale.quantity));
    setResult(calculation);

    if (!calculation.isValid) {
      pushToast(calculation.error, "error");
    } else {
      pushToast("Peramalan regresi linier berhasil dihitung.");
    }
  }

  function approveForecast() {
    if (!result?.isValid) {
      pushToast("Hitung forecast terlebih dahulu.", "error");
      return;
    }

    saveForecast({
      productId,
      period: nextPeriod,
      historicalPeriods: productSales.length,
      quantity: result.predictedY,
      predictedQuantity: result.predictedY,
      calculation: result,
      status: "Disetujui",
    });
  }

  return (
    <div>
      <PageHeader
        title="Peramalan Produksi"
        description="Linear Regression adalah metode machine learning yang digunakan aplikasi ini untuk memprediksi produksi periode berikutnya berdasarkan tren penjualan historis."
        actions={
          <>
            <button type="button" onClick={runForecast} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Hitung Forecast
            </button>
            <button type="button" onClick={approveForecast} className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
              <Save className="h-4 w-4" aria-hidden="true" />
              Setujui & Simpan
            </button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label className="text-sm font-medium text-gray-700">
          Produk
          <select value={productId} onChange={(event) => { setProductId(event.target.value); setResult(null); }} className={`${inputClass} w-full`}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Jumlah Periode
          <select value={periodCount} onChange={(event) => { setPeriodCount(event.target.value); setResult(null); }} className={`${inputClass} w-full`}>
            {[3, 6, 9, 12].map((count) => (
              <option key={count} value={count}>{count} bulan</option>
            ))}
          </select>
        </label>
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500">Periode Prediksi</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatPeriod(nextPeriod)}</p>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Grafik Aktual dan Garis Regresi</h2>
            <p className="text-sm text-gray-500">{product?.name} · X = periode ke-1 sampai ke-{productSales.length}</p>
          </div>
          {result?.isValid ? <StatusBadge status={`Prediksi ${formatNumber(result.predictedY)} pcs`} /> : null}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value, name) => [`${formatNumber(value)} pcs`, name === "actual" ? "Aktual" : "Regresi"]} />
              <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="regression" stroke="#16a34a" strokeWidth={2} dot={false} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_24rem]">
        <DataTableWrapper empty={productSales.length === 0}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">X</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Periode</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Y</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">XY</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">X²</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {productSales.map((sale, index) => {
                const row = result?.rows?.[index] || {
                  x: index + 1,
                  y: sale.quantity,
                  xy: (index + 1) * sale.quantity,
                  xSquare: (index + 1) * (index + 1),
                };
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{row.x}</td>
                    <td className="px-4 py-3 text-gray-600">{formatPeriod(sale.period)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatNumber(row.y)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatNumber(row.xy)}</td>
                    <td className="px-4 py-3 text-right text-gray-900">{formatNumber(row.xSquare)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTableWrapper>

        <aside className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Detail Perhitungan</h2>
          {result?.isValid ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500">n</dt><dd className="font-semibold text-gray-900">{result.n}</dd></div>
              <div><dt className="text-gray-500">sumX</dt><dd className="font-semibold text-gray-900">{formatNumber(result.sumX)}</dd></div>
              <div><dt className="text-gray-500">sumY</dt><dd className="font-semibold text-gray-900">{formatNumber(result.sumY)}</dd></div>
              <div><dt className="text-gray-500">sumXY</dt><dd className="font-semibold text-gray-900">{formatNumber(result.sumXY)}</dd></div>
              <div><dt className="text-gray-500">sumXSquare</dt><dd className="font-semibold text-gray-900">{formatNumber(result.sumXSquare)}</dd></div>
              <div><dt className="text-gray-500">nextX</dt><dd className="font-semibold text-gray-900">{result.nextX}</dd></div>
              <div><dt className="text-gray-500">Intercept a</dt><dd className="font-semibold text-gray-900">{formatNumber(result.intercept, { maximumFractionDigits: 2 })}</dd></div>
              <div><dt className="text-gray-500">Slope b</dt><dd className="font-semibold text-gray-900">{formatNumber(result.slope, { maximumFractionDigits: 2 })}</dd></div>
              <div className="col-span-2 rounded-md bg-blue-50 p-3">
                <dt className="text-blue-700">Persamaan Regresi</dt>
                <dd className="mt-1 font-mono text-sm font-semibold text-blue-900">{result.equation}</dd>
              </div>
              <div className="col-span-2 rounded-md bg-green-50 p-3">
                <dt className="text-green-700">Prediksi Produksi Berikutnya</dt>
                <dd className="mt-1 text-xl font-semibold text-green-900">{formatNumber(result.predictedY)} pcs</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Klik Hitung Forecast untuk melihat nilai a, b, dan prediksi.</p>
          )}
        </aside>
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Riwayat Forecast</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {forecastHistory.map((forecast) => (
            <div key={forecast.id} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{formatPeriod(forecast.period)} · {forecast.method}</p>
                <p className="text-sm text-gray-500">Berdasarkan {forecast.historicalPeriods} periode historis</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-900">{formatNumber(forecast.predictedQuantity || forecast.quantity)} pcs</p>
                <StatusBadge status={forecast.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
