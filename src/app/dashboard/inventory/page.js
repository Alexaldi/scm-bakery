"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import SearchInput from "@/components/search-input";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatNumber, searchText, stockStatus } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function InventoryPage() {
  const { inventories, rawMaterials, products, inventoryMovements, adjustInventory } = useScm();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [selectedKey, setSelectedKey] = useState(`${inventories[0]?.itemType}:${inventories[0]?.rawMaterialId || inventories[0]?.productId}`);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    itemType: "raw-material",
    itemId: rawMaterials[0]?.id || "",
    movementType: "Masuk",
    quantity: 0,
    reference: "ADJ-DEMO",
    notes: "Penyesuaian stok demo",
  });

  const rows = inventories.map((inventory) => {
    const item =
      inventory.itemType === "raw-material"
        ? rawMaterials.find((material) => material.id === inventory.rawMaterialId)
        : products.find((product) => product.id === inventory.productId);
    const itemId = inventory.rawMaterialId || inventory.productId;
    const movements = inventoryMovements.filter(
      (movement) => movement.itemType === inventory.itemType && movement.itemId === itemId
    );
    const incoming = movements.filter((movement) => movement.type === "Masuk").reduce((total, movement) => total + Number(movement.quantity || 0), 0);
    const outgoing = movements.filter((movement) => movement.type === "Keluar").reduce((total, movement) => total + Number(movement.quantity || 0), 0);

    return {
      ...inventory,
      itemId,
      itemName: item?.name || "-",
      itemCode: item?.code || "-",
      category: item?.category || "Produk Jadi",
      incoming,
      outgoing,
      stockStatus: stockStatus(inventory.currentStock, inventory.safetyStock),
      key: `${inventory.itemType}:${itemId}`,
    };
  });

  const filteredRows = rows.filter(
    (row) =>
      searchText(row, ["itemCode", "itemName", "category", "warehouseLocation"], search) &&
      (statusFilter === "Semua" || row.stockStatus === statusFilter)
  );
  const selected = rows.find((row) => row.key === selectedKey) || filteredRows[0];
  const stockCard = inventoryMovements.filter(
    (movement) => movement.itemType === selected?.itemType && movement.itemId === selected?.itemId
  );

  function submitAdjustment(event) {
    event.preventDefault();
    const inventory = inventories.find(
      (item) =>
        item.itemType === form.itemType &&
        (form.itemType === "raw-material" ? item.rawMaterialId === form.itemId : item.productId === form.itemId)
    );
    adjustInventory({
      ...form,
      unit: inventory?.inventoryUnit,
    });
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Persediaan"
        description="Pantau stok bahan baku dan produk jadi, termasuk safety stock, minimum stock, transaksi masuk/keluar, dan kartu stok."
        actions={
          <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Penyesuaian Stok
          </button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem]">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari bahan, produk, kategori, atau lokasi..." />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
          <option>Semua</option>
          <option>Aman</option>
          <option>Menipis</option>
          <option>Habis</option>
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_26rem]">
        <DataTableWrapper empty={filteredRows.length === 0}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Item</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Current Stock</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Safety Stock</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Minimum</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Masuk</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Keluar</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredRows.map((row) => (
                <tr key={row.key} className={selected?.key === row.key ? "bg-blue-50/60" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelectedKey(row.key)} className="text-left font-medium text-blue-700 hover:text-blue-800">
                      {row.itemName}
                    </button>
                    <p className="text-xs text-gray-500">{row.itemCode} - {row.itemType === "raw-material" ? "Bahan Baku" : "Produk Jadi"}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(row.currentStock, { maximumFractionDigits: 2 })} {row.inventoryUnit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(row.safetyStock)} {row.inventoryUnit}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{formatNumber(row.minimumStock)} {row.inventoryUnit}</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatNumber(row.incoming, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-right text-red-700">{formatNumber(row.outgoing, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={row.stockStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>

        <aside className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-base font-semibold text-gray-900">Kartu Stok</h2>
            <p className="mt-1 text-sm text-gray-500">{selected?.itemName || "Pilih item untuk melihat kartu stok."}</p>
          </div>
          <div className="max-h-[32rem] overflow-y-auto">
            {stockCard.length ? (
              stockCard.map((movement) => (
                <div key={movement.id} className="border-b border-gray-100 p-4 last:border-b-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">{movement.reference}</p>
                    <StatusBadge status={movement.type} />
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {formatNumber(movement.quantity, { maximumFractionDigits: 2 })} {movement.unit} - {movement.date}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{movement.notes}</p>
                </div>
              ))
            ) : (
              <p className="p-5 text-sm text-gray-500">Belum ada mutasi untuk item ini.</p>
            )}
          </div>
        </aside>
      </div>

      <FormModal open={modalOpen} title="Penyesuaian Stok Simulasi" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitAdjustment} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Jenis Item<select value={form.itemType} onChange={(event) => setForm({ ...form, itemType: event.target.value, itemId: event.target.value === "raw-material" ? rawMaterials[0]?.id || "" : products[0]?.id || "" })} className={inputClass}><option value="raw-material">Bahan Baku</option><option value="finished-product">Produk Jadi</option></select></label>
          <label className="text-sm font-medium text-gray-700">Item<select value={form.itemId} onChange={(event) => setForm({ ...form, itemId: event.target.value })} className={inputClass}>{(form.itemType === "raw-material" ? rawMaterials : products).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Jenis Mutasi<select value={form.movementType} onChange={(event) => setForm({ ...form, movementType: event.target.value })} className={inputClass}><option>Masuk</option><option>Keluar</option></select></label>
          <label className="text-sm font-medium text-gray-700">Jumlah<input type="number" step="0.01" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Referensi<input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Catatan<input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className={inputClass} /></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Simpan Penyesuaian</button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
