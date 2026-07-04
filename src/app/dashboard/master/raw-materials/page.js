"use client";

import { Edit, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import ConfirmDialog from "@/components/confirm-dialog";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import SearchInput from "@/components/search-input";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatNumber, searchText, stockStatus } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const emptyMaterial = {
  code: "",
  name: "",
  category: "Tepung",
  inventoryUnit: "kg",
  currentStock: 0,
  safetyStock: 0,
  minimumStock: 0,
  warehouseLocation: "",
  status: "Aktif",
};

export default function RawMaterialsPage() {
  const { rawMaterials, saveRawMaterial, deleteRecord } = useScm();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [form, setForm] = useState(emptyMaterial);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = useMemo(() => ["Semua", ...new Set(rawMaterials.map((item) => item.category))], [rawMaterials]);
  const [category, setCategory] = useState("Semua");

  const filteredMaterials = rawMaterials.filter((material) => {
    const currentStatus = stockStatus(material.currentStock, material.safetyStock);
    return (
      searchText(material, ["code", "name", "category", "warehouseLocation"], search) &&
      (category === "Semua" || material.category === category) &&
      (statusFilter === "Semua" || currentStatus === statusFilter)
    );
  });

  function openCreateModal() {
    setForm({
      ...emptyMaterial,
      code: `BB-${String(rawMaterials.length + 1).padStart(3, "0")}`,
    });
    setModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    saveRawMaterial(form);
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Bahan Baku"
        description="Master bahan baku sekaligus ringkasan stok awal, safety stock, minimum stock, dan lokasi gudang."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Bahan
          </button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_12rem]">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari bahan, kategori, atau lokasi..." />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option>Semua</option>
          <option>Aman</option>
          <option>Menipis</option>
          <option>Habis</option>
        </select>
      </div>

      <DataTableWrapper empty={filteredMaterials.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Kode</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Bahan Baku</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Stok</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Safety</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Lokasi</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status Stok</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{material.code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{material.name}</p>
                  <p className="text-xs text-gray-500">{material.category}</p>
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatNumber(material.currentStock)} {material.inventoryUnit}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {formatNumber(material.safetyStock)} {material.inventoryUnit}
                </td>
                <td className="px-4 py-3 text-gray-600">{material.warehouseLocation}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={stockStatus(material.currentStock, material.safetyStock)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm(material);
                        setModalOpen(true);
                      }}
                      className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
                      aria-label={`Edit ${material.name}`}
                    >
                      <Edit className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(material)}
                      className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Hapus ${material.name}`}
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

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-blue-50 p-2 text-blue-700">
            <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Aturan Status Stok</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Status Aman berarti stok di atas safety stock. Menipis berarti stok masih tersedia tetapi tidak
              melebihi safety stock. Habis berarti stok sama dengan atau kurang dari nol.
            </p>
          </div>
        </div>
      </section>

      <FormModal open={modalOpen} title={form.id ? "Edit Bahan Baku" : "Tambah Bahan Baku"} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Kode
            <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Nama Bahan
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Kategori
            <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Unit Inventory
            <input value={form.inventoryUnit} onChange={(event) => setForm({ ...form, inventoryUnit: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Current Stock
            <input type="number" step="0.01" value={form.currentStock} onChange={(event) => setForm({ ...form, currentStock: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Safety Stock
            <input type="number" step="0.01" value={form.safetyStock} onChange={(event) => setForm({ ...form, safetyStock: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Minimum Stock
            <input type="number" step="0.01" value={form.minimumStock} onChange={(event) => setForm({ ...form, minimumStock: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Lokasi Gudang
            <input value={form.warehouseLocation} onChange={(event) => setForm({ ...form, warehouseLocation: event.target.value })} className={inputClass} required />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Simpan Bahan
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus bahan baku?"
        description={`Bahan ${deleteTarget?.name || ""} akan dihapus dari data demo.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRecord("rawMaterials", deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
