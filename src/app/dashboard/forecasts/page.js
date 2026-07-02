export default function ForecastsPage() {
  return (
    <div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Peramalan Produksi
        </h2>

        <p className="mt-1 text-gray-600">
          Prediksi produksi bulan berikutnya menggunakan regresi linier.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900">
          Hasil Prediksi
        </h3>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Nilai Intercept a
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              166,21
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Nilai Slope b
            </p>

            <p className="mt-2 text-xl font-bold text-gray-900">
              10,49
            </p>
          </div>

          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Prediksi Bulan Berikutnya
            </p>

            <p className="mt-2 text-xl font-bold text-blue-900">
              303 pcs
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">
            Persamaan Regresi
          </p>

          <p className="mt-2 font-mono text-lg font-semibold text-gray-900">
            Y = 166,21 + 10,49X
          </p>
        </div>
      </div>
    </div>
  );
}