"use client";

import { CheckCircle2, Edit, Info, Plus, Power, X, XCircle } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/confirm-dialog";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import SearchInput from "@/components/search-input";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate, searchText } from "@/lib/utils/format";
import { changeProductStatus, createProduct, updateProduct } from "./actions";
import { productStatusLabel } from "./product-validation";

const emptyProduct = {
  code: "",
  name: "",
  category: "Pastry",
  sellingPrice: "",
  unit: "pcs",
  shelfLifeDays: 2,
  status: "ACTIVE",
};

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function nextProductCode(products) {
  const nextNumber =
    products.reduce((max, product) => {
      const match = product.code.match(/^PRD-(\d+)$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;

  return `PRD-${String(nextNumber).padStart(3, "0")}`;
}

function ProductsToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [onClose, toast]);

  if (!toast) {
    return null;
  }

  const Icon = toast.type === "error" ? XCircle : toast.type === "info" ? Info : CheckCircle2;
  const tone =
    toast.type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : toast.type === "info"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-green-200 bg-green-50 text-green-800";

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[min(24rem,calc(100vw-2rem))]">
      <div
        role={toast.type === "error" ? "alert" : "status"}
        aria-live={toast.type === "error" ? "assertive" : "polite"}
        aria-atomic="true"
        className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${tone}`}
      >
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
        <button type="button" onClick={onClose} className="rounded-md p-1 hover:bg-white/60" aria-label="Tutup notifikasi">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function ProductsClient({ initialProducts }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [selectedId, setSelectedId] = useState(initialProducts[0]?.id || "");
  const [form, setForm] = useState(emptyProduct);
  const [formError, setFormError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(() => ["Semua", ...new Set(initialProducts.map((product) => product.category))], [initialProducts]);
  const filteredProducts = initialProducts.filter(
    (product) =>
      searchText(product, ["code", "name", "category"], search) &&
      (category === "Semua" || product.category === category) &&
      (status === "Semua" || product.status === status)
  );
  const selectedProduct = initialProducts.find((product) => product.id === selectedId) || filteredProducts[0];

  function showToast(message, type = "success") {
    setToast({ id: Date.now(), message, type });
  }

  function closeFormModal() {
    if (!isPending) {
      setModalOpen(false);
    }
  }

  function closeStatusDialog() {
    if (!isPending) {
      setStatusTarget(null);
    }
  }

  function openCreateModal() {
    setForm({ ...emptyProduct, code: nextProductCode(initialProducts) });
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(product) {
    setForm(product);
    setFormError("");
    setModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    setFormError("");

    startTransition(async () => {
      const action = form.id ? updateProduct(form.id, form) : createProduct(form);
      const result = await action;

      if (!result.ok) {
        setFormError(result.message);
        return;
      }

      setSelectedId(result.product.id);
      setModalOpen(false);
      showToast(result.message);
      router.refresh();
    });
  }

  function confirmStatusChange() {
    if (!statusTarget) {
      return;
    }

    const nextStatus = statusTarget.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    startTransition(async () => {
      const result = await changeProductStatus(statusTarget.id, nextStatus);

      if (!result.ok) {
        showToast(result.message, "error");
        return;
      }

      setStatusTarget(null);
      showToast(result.message);
      router.refresh();
    });
  }

  return (
    <div>
      <PageHeader
        title="Produk"
        description="Master produk bakery yang digunakan pada penjualan, peramalan, produksi, dan distribusi."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Produk
          </button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_10rem]">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari kode, nama, atau kategori..." />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
          <option value="Semua">Semua</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Tidak Aktif</option>
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <DataTableWrapper empty={filteredProducts.length === 0}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kode</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Harga Jual</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={selectedProduct?.id === product.id ? "bg-blue-50/60" : "hover:bg-gray-50"}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{product.code}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelectedId(product.id)}
                      className="text-left font-medium text-blue-700 hover:text-blue-800"
                    >
                      {product.name}
                    </button>
                    <p className="text-xs text-gray-500">Umur simpan {product.shelfLifeDays} hari</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={productStatusLabel(product.status)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusTarget(product)}
                        className={`rounded-md border p-2 ${
                          product.status === "ACTIVE"
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-green-200 text-green-600 hover:bg-green-50"
                        }`}
                        aria-label={`${product.status === "ACTIVE" ? "Nonaktifkan" : "Aktifkan"} ${product.name}`}
                      >
                        <Power className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>

        <aside className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Detail Produk</h2>
          {selectedProduct ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Nama Produk</dt>
                <dd className="font-medium text-gray-900">{selectedProduct.name}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Kode</dt>
                <dd className="font-medium text-gray-900">{selectedProduct.code}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Kategori</dt>
                <dd className="font-medium text-gray-900">{selectedProduct.category}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Harga Jual</dt>
                <dd className="font-medium text-gray-900">{formatCurrency(selectedProduct.sellingPrice)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Umur Simpan</dt>
                <dd className="font-medium text-gray-900">{selectedProduct.shelfLifeDays} hari</dd>
              </div>
              <div>
                <dt className="text-gray-500">Unit</dt>
                <dd className="font-medium text-gray-900">{selectedProduct.unit}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd className="font-medium text-gray-900">{productStatusLabel(selectedProduct.status)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Terakhir Diubah</dt>
                <dd className="font-medium text-gray-900">{formatDate(selectedProduct.updatedAt)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Pilih produk untuk melihat detail.</p>
          )}
        </aside>
      </div>

      <FormModal open={modalOpen} title={form.id ? "Edit Produk" : "Tambah Produk"} onClose={closeFormModal}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          {formError ? (
            <div
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 md:col-span-2"
            >
              {formError}
            </div>
          ) : null}
          <label className="text-sm font-medium text-gray-700">
            Kode
            <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Nama Produk
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Kategori
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Harga Jual
            <input
              type="number"
              min="1"
              value={form.sellingPrice}
              onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Unit
            <input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Umur Simpan (hari)
            <input
              type="number"
              min="1"
              step="1"
              value={form.shelfLifeDays}
              onChange={(event) => setForm({ ...form, shelfLifeDays: event.target.value })}
              className={inputClass}
              required
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClass}>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">Tidak Aktif</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={closeFormModal} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isPending ? "Menyimpan..." : "Simpan Produk"}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={statusTarget?.status === "ACTIVE" ? "Nonaktifkan produk?" : "Aktifkan produk?"}
        description={`Status produk ${statusTarget?.name || ""} akan diubah menjadi ${
          statusTarget?.status === "ACTIVE" ? "Tidak Aktif" : "Aktif"
        }.`}
        confirmLabel={statusTarget?.status === "ACTIVE" ? "Ya, nonaktifkan" : "Ya, aktifkan"}
        onClose={closeStatusDialog}
        onConfirm={confirmStatusChange}
      />

      <ProductsToast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
