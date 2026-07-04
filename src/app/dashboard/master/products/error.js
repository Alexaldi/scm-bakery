"use client";

import { RefreshCw } from "lucide-react";
import { useEffect } from "react";

export default function ProductsError({ error, unstable_retry }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Error halaman Produk:", {
        message: error?.message,
        digest: error?.digest,
      });
    }
  }, [error]);

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-900">
      <h1 className="text-lg font-semibold">Data produk tidak dapat dimuat</h1>
      <p className="mt-2 text-sm" role="alert">
        Data produk tidak dapat dimuat. Periksa koneksi lalu coba kembali.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Coba Lagi
      </button>
    </div>
  );
}
