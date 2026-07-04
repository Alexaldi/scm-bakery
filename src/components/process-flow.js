const steps = [
  "Master Data",
  "Penjualan",
  "Peramalan",
  "BOM",
  "MRP",
  "Persediaan",
  "Supplier",
  "Pengadaan",
  "PO",
  "Penerimaan",
  "Produksi",
  "Distribusi",
  "Laporan",
];

export default function ProcessFlow() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
              {step}
            </span>
            {index < steps.length - 1 ? <span className="hidden text-gray-300 sm:inline">/</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
