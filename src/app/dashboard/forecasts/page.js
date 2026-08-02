"use client";

import { Save } from "lucide-react";
import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import DataTableWrapper from "@/components/data-table-wrapper";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { calculateBestLinearRegression } from "@/lib/services/linear-regression";
import { formatNumber, formatPeriod, getCurrentPeriod, getNextPeriod } from "@/lib/utils/format";

const inputClass =
  "h-10 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ForecastsPage() {
  const { products, monthlySales, forecasts, saveForecast, pushToast } = useScm();
  const [productId, setProductId] = useState(products[0]?.id || "");

  const product = products.find((item) => item.id === productId);
  const productSales = useMemo(
    () =>
      monthlySales
        .filter((sale) => sale.productId === productId)
        .sort((a, b) => a.period.localeCompare(b.period)),
    [monthlySales, productId]
  );
  const result = useMemo(
    () => calculateBestLinearRegression(productSales.map((sale) => sale.quantity)),
    [productSales]
  );
  const latestPeriod = productSales.at(-1)?.period || getCurrentPeriod();
  const nextPeriod = getNextPeriod(latestPeriod);
  const selectedSales = result?.selectedRange ? productSales.slice(-result.selectedRange) : productSales;
  const chartData = selectedSales.map((sale, index) => ({
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

  function approveForecast() {
    if (!result?.isValid) {
      pushToast(result?.error || "Data penjualan belum cukup untuk peramalan.", "error");
      return;
    }

    saveForecast({
      productId,
      period: nextPeriod,
      historicalPeriods: result.selectedRange || productSales.length,
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
        description="Regresi Linier digunakan untuk memprediksi jumlah produksi periode berikutnya berdasarkan tren penjualan historis."
        actions={
          <button
            type="button"
            onClick={approveForecast}
            disabled={!result?.isValid}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Simpan Peramalan
          </button>
        }
      />

      <div className="mb-6 grid gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="text-sm font-medium text-gray-700">
          Produk
          <select value={productId} onChange={(event) => setProductId(event.target.value)} className={`${inputClass} w-full`}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
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
            <h2 className="text-base font-semibold text-gray-900">Grafik Penjualan dan Tren Peramalan</h2>
            <p className="text-sm text-gray-500">{product?.name} berdasarkan range terbaik sistem</p>
          </div>
          {result?.isValid ? <StatusBadge status={`Prediksi ${formatNumber(result.predictedY)} pcs`} /> : null}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
              <Tooltip formatter={(value, name) => [`${formatNumber(value)} pcs`, name === "actual" ? "Aktual" : "Tren"]} />
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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Periode</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Terjual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {selectedSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{formatPeriod(sale.period)}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatNumber(sale.quantity)} pcs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>

        <aside className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Hasil Peramalan</h2>
          {result?.isValid ? (
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Produk</dt>
                <dd className="font-semibold text-gray-900">{product?.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Periode Produksi</dt>
                <dd className="font-semibold text-gray-900">{formatPeriod(nextPeriod)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Data Historis</dt>
                <dd className="font-semibold text-gray-900">{result.selectedRange} bulan terbaik</dd>
              </div>
              <div>
                <dt className="text-gray-500">Error Uji Prediksi</dt>
                <dd className="font-semibold text-gray-900">
                  {result.backtestError === null ? "-" : `${formatNumber(result.backtestError)} pcs`}
                </dd>
              </div>
              <div className="rounded-md bg-green-50 p-3">
                <dt className="text-green-700">Rekomendasi Jumlah Produksi</dt>
                <dd className="mt-1 text-2xl font-semibold text-green-900">{formatNumber(result.predictedY)} pcs</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-gray-500">{result?.error || "Data penjualan belum cukup untuk peramalan."}</p>
          )}
        </aside>
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Riwayat Peramalan</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {forecastHistory.map((forecast) => (
            <div key={forecast.id} className="flex flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{formatPeriod(forecast.period)} - {forecast.method}</p>
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
