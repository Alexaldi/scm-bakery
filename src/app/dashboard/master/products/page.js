"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmDialog from "@/components/confirm-dialog";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import SearchInput from "@/components/search-input";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatCurrency, formatNumber, searchText } from "@/lib/utils/format";

const emptyProduct = {
  code: "",
  name: "",
  category: "Pastry",
  sellingPrice: 0,
  unit: "pcs",
  shelfLife: 2,
  status: "Aktif",
  finishedStock: 0,
};

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function ProductsPage() {
  const { products, saveProduct, deleteRecord } = useScm();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [status, setStatus] = useState("Semua");
  const [selectedId, setSelectedId] = useState(products[0]?.id || "");
  const [form, setForm] = useState(emptyProduct);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = useMemo(() => ["Semua", ...new Set(products.map((product) => product.category))], [products]);
  const filteredProducts = products.filter(
    (product) =>
      searchText(product, ["code", "name", "category"], search) &&
      (category === "Semua" || product.category === category) &&
      (status === "Semua" || product.status === status)
  );
  const selectedProduct = products.find((product) => product.id === selectedId) || filteredProducts[0];

  function openCreateModal() {
    setForm({ ...emptyProduct, code: `PRD-${String(products.length + 1).padStart(3, "0")}` });
    setModalOpen(true);
  }

  function openEditModal(product) {
    setForm(product);
    setModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    const saved = {
      ...form,
      sellingPrice: Number(form.sellingPrice || 0),
      shelfLife: Number(form.shelfLife || 0),
      finishedStock: Number(form.finishedStock || 0),
    };
    saveProduct(saved);
    setSelectedId(saved.id || selectedId);
    setModalOpen(false);
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
          <option>Semua</option>
          <option>Aktif</option>
          <option>Tidak Aktif</option>
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
                    <p className="text-xs text-gray-500">{formatNumber(product.finishedStock)} stok jadi</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(product.sellingPrice)}</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={product.status} />
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
                        onClick={() => setDeleteTarget(product)}
                        className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                        aria-label={`Hapus ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
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
                <dd className="font-medium text-gray-900">{selectedProduct.shelfLife} hari</dd>
              </div>
              <div>
                <dt className="text-gray-500">Unit</dt>
                <dd className="font-medium text-gray-900">{selectedProduct.unit}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-gray-500">Pilih produk untuk melihat detail.</p>
          )}
        </aside>
      </div>

      <FormModal open={modalOpen} title={form.id ? "Edit Produk" : "Tambah Produk"} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
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
            <input type="number" value={form.sellingPrice} onChange={(event) => setForm({ ...form, sellingPrice: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Unit
            <input value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Umur Simpan (hari)
            <input type="number" value={form.shelfLife} onChange={(event) => setForm({ ...form, shelfLife: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Stok Produk Jadi
            <input type="number" value={form.finishedStock} onChange={(event) => setForm({ ...form, finishedStock: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClass}>
              <option>Aktif</option>
              <option>Tidak Aktif</option>
            </select>
          </label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Simpan Produk
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus produk?"
        description={`Produk ${deleteTarget?.name || ""} akan dihapus dari data demo.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRecord("products", deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
