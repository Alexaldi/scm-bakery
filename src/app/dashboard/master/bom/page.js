"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/confirm-dialog";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import { useScm } from "@/context/scm-context";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function emptyBom(productId, rawMaterial) {
  return {
    productId,
    rawMaterialId: rawMaterial?.id || "",
    quantityPerProduct: 0,
    usageUnit: "gram",
    inventoryUnit: rawMaterial?.inventoryUnit || "kg",
    conversionFactor: 0.001,
  };
}

export default function BomPage() {
  const { products, rawMaterials, bom, saveBomItem, deleteRecord } = useScm();
  const [productId, setProductId] = useState(products[0]?.id || "");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyBom(productId, rawMaterials[0]));
  const [deleteTarget, setDeleteTarget] = useState(null);

  const product = products.find((item) => item.id === productId);
  const productBom = bom.filter((item) => item.productId === productId);
  const totalConverted = productBom.reduce(
    (total, item) => total + Number(item.quantityPerProduct || 0) * Number(item.conversionFactor || 1),
    0
  );
  const usedMaterialIds = new Set(productBom.map((item) => item.rawMaterialId));
  const availableMaterials = rawMaterials.filter(
    (material) => !usedMaterialIds.has(material.id) || material.id === form.rawMaterialId
  );

  function openCreateModal() {
    setForm(emptyBom(productId, availableMaterials[0] || rawMaterials[0]));
    setModalOpen(true);
  }

  function openEditModal(item) {
    setForm(item);
    setModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    saveBomItem(form);
    setModalOpen(false);
  }

  function selectMaterial(rawMaterialId) {
    const material = rawMaterials.find((item) => item.id === rawMaterialId);
    setForm({
      ...form,
      rawMaterialId,
      inventoryUnit: material?.inventoryUnit || form.inventoryUnit,
      conversionFactor:
        material?.inventoryUnit === "kg" ? 0.001 : material?.inventoryUnit === "liter" ? 0.001 : 1,
    });
  }

  return (
    <div>
      <PageHeader
        title="Bill of Material"
        description="BOM adalah komposisi bahan baku yang diperlukan untuk memproduksi satu unit produk."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Item BOM
          </button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[18rem_1fr]">
        <label className="text-sm font-medium text-gray-700">
          Pilih Produk
          <select value={productId} onChange={(event) => setProductId(event.target.value)} className={inputClass}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {product ? (
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid gap-3 text-sm md:grid-cols-4">
              <div>
                <p className="text-gray-500">Kode</p>
                <p className="font-semibold text-gray-900">{product.code}</p>
              </div>
              <div>
                <p className="text-gray-500">Produk</p>
                <p className="font-semibold text-gray-900">{product.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Harga Jual</p>
                <p className="font-semibold text-gray-900">{formatCurrency(product.sellingPrice)}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Item BOM</p>
                <p className="font-semibold text-gray-900">{productBom.length} bahan</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <DataTableWrapper empty={productBom.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Bahan Baku</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Qty per Produk</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Unit Sumber</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Unit Inventory</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Faktor Konversi</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Qty Terkonversi</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {productBom.map((item) => {
              const material = rawMaterials.find((rawMaterial) => rawMaterial.id === item.rawMaterialId);
              const converted = Number(item.quantityPerProduct || 0) * Number(item.conversionFactor || 1);

              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{material?.name || "-"}</p>
                    <p className="text-xs text-gray-500">{material?.code}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatNumber(item.quantityPerProduct)}</td>
                  <td className="px-4 py-3 text-gray-600">{item.usageUnit}</td>
                  <td className="px-4 py-3 text-gray-600">{item.inventoryUnit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(item.conversionFactor, { maximumFractionDigits: 4 })}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatNumber(converted, { maximumFractionDigits: 4 })} {item.inventoryUnit}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => openEditModal(item)} className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Edit BOM">
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Hapus BOM">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableWrapper>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Item BOM</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{productBom.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:col-span-2">
          <p className="text-sm font-semibold text-gray-900">Contoh konversi unit</p>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            1000 gram = 1 kilogram, 1000 mililiter = 1 liter, sedangkan butir tetap dihitung sebagai butir.
            Total kuantitas terkonversi BOM produk ini adalah {formatNumber(totalConverted, { maximumFractionDigits: 4 })} dalam berbagai unit inventory.
          </p>
        </div>
      </section>

      <FormModal open={modalOpen} title={form.id ? "Edit Item BOM" : "Tambah Item BOM"} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Bahan Baku
            <select value={form.rawMaterialId} onChange={(event) => selectMaterial(event.target.value)} className={inputClass} required>
              {availableMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">
            Quantity per Produk
            <input type="number" step="0.0001" value={form.quantityPerProduct} onChange={(event) => setForm({ ...form, quantityPerProduct: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Usage Unit
            <select value={form.usageUnit} onChange={(event) => setForm({ ...form, usageUnit: event.target.value })} className={inputClass}>
              <option>gram</option>
              <option>mililiter</option>
              <option>butir</option>
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">
            Inventory Unit
            <input value={form.inventoryUnit} onChange={(event) => setForm({ ...form, inventoryUnit: event.target.value })} className={inputClass} required />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Conversion Factor
            <input type="number" step="0.0001" value={form.conversionFactor} onChange={(event) => setForm({ ...form, conversionFactor: event.target.value })} className={inputClass} required />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Simpan BOM
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus item BOM?"
        description="Item ini akan dihapus dari komposisi produk."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRecord("bom", deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
