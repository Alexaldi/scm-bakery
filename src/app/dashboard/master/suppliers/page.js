"use client";

import { Edit, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "@/components/confirm-dialog";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import SearchInput from "@/components/search-input";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatCurrency, formatNumber, searchText } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const emptySupplier = {
  code: "",
  name: "",
  address: "",
  contact: "",
  phone: "",
  email: "",
  distance: 0,
  status: "Aktif",
};

const emptyOffer = {
  supplierId: "",
  rawMaterialId: "",
  price: 0,
  qualityScore: 4,
  capacity: 0,
  distance: 0,
  minimumOrder: 0,
  leadTime: 1,
  unit: "kg",
};

export default function SuppliersPage() {
  const { suppliers, supplierOffers, rawMaterials, saveRecord, deleteRecord } = useScm();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(suppliers[0]?.id || "");
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [offerForm, setOfferForm] = useState(emptyOffer);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredSuppliers = suppliers.filter((supplier) =>
    searchText(supplier, ["code", "name", "contact", "address"], search)
  );
  const selectedSupplier = suppliers.find((supplier) => supplier.id === selectedId) || filteredSuppliers[0];
  const offers = supplierOffers.filter((offer) => offer.supplierId === selectedSupplier?.id);

  function openCreateSupplier() {
    setSupplierForm({ ...emptySupplier, code: `SUP-${String(suppliers.length + 1).padStart(3, "0")}` });
    setSupplierModalOpen(true);
  }

  function openOfferModal(offer) {
    const firstMaterial = rawMaterials[0];
    setOfferForm(
      offer || {
        ...emptyOffer,
        supplierId: selectedSupplier?.id || "",
        rawMaterialId: firstMaterial?.id || "",
        unit: firstMaterial?.inventoryUnit || "kg",
        distance: selectedSupplier?.distance || 0,
      }
    );
    setOfferModalOpen(true);
  }

  function submitSupplier(event) {
    event.preventDefault();
    saveRecord("suppliers", {
      ...supplierForm,
      distance: Number(supplierForm.distance || 0),
    });
    setSupplierModalOpen(false);
  }

  function submitOffer(event) {
    event.preventDefault();
    saveRecord("supplierOffers", {
      ...offerForm,
      price: Number(offerForm.price || 0),
      qualityScore: Number(offerForm.qualityScore || 0),
      capacity: Number(offerForm.capacity || 0),
      distance: Number(offerForm.distance || 0),
      minimumOrder: Number(offerForm.minimumOrder || 0),
      leadTime: Number(offerForm.leadTime || 0),
    });
    setOfferModalOpen(false);
  }

  function selectOfferMaterial(rawMaterialId) {
    const material = rawMaterials.find((item) => item.id === rawMaterialId);
    setOfferForm({ ...offerForm, rawMaterialId, unit: material?.inventoryUnit || offerForm.unit });
  }

  return (
    <div>
      <PageHeader
        title="Supplier"
        description="Master supplier dan penawaran bahan baku yang digunakan pada pemilihan supplier metode Weighted Product."
        actions={
          <button
            type="button"
            onClick={openCreateSupplier}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Supplier
          </button>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari supplier, kontak, atau alamat..." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_28rem]">
        <DataTableWrapper empty={filteredSuppliers.length === 0}>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kode</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Kontak</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Jarak</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className={selectedSupplier?.id === supplier.id ? "bg-blue-50/60" : "hover:bg-gray-50"}>
                  <td className="px-4 py-3 font-medium text-gray-900">{supplier.code}</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => setSelectedId(supplier.id)} className="text-left font-medium text-blue-700 hover:text-blue-800">
                      {supplier.name}
                    </button>
                    <p className="text-xs text-gray-500">{supplier.address}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{supplier.contact}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatNumber(supplier.distance)} km</td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={supplier.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => { setSupplierForm(supplier); setSupplierModalOpen(true); }} className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Edit supplier">
                        <Edit className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget({ type: "supplier", data: supplier })} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Hapus supplier">
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTableWrapper>

        <aside className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selectedSupplier?.name || "Detail Supplier"}</h2>
                <p className="mt-1 text-sm text-gray-500">{selectedSupplier?.address}</p>
              </div>
              {selectedSupplier ? <StatusBadge status={selectedSupplier.status} /> : null}
            </div>
            {selectedSupplier ? (
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Kontak</dt>
                  <dd className="font-medium text-gray-900">{selectedSupplier.contact}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Telepon</dt>
                  <dd className="font-medium text-gray-900">{selectedSupplier.phone}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{selectedSupplier.email}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Jarak</dt>
                  <dd className="font-medium text-gray-900">{formatNumber(selectedSupplier.distance)} km</dd>
                </div>
              </dl>
            ) : null}
          </div>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Material yang Disuplai</h3>
              <button type="button" onClick={() => openOfferModal()} className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                Tambah Offer
              </button>
            </div>
            <div className="space-y-3">
              {offers.map((offer) => {
                const material = rawMaterials.find((item) => item.id === offer.rawMaterialId);

                return (
                  <div key={offer.id} className="rounded-md border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{material?.name || "-"}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(offer.price)} / {offer.unit} - Lead time {offer.leadTime} hari
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => openOfferModal(offer)} className="rounded-md p-1.5 text-gray-600 hover:bg-gray-100" aria-label="Edit offer">
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setDeleteTarget({ type: "offer", data: offer })} className="rounded-md p-1.5 text-red-600 hover:bg-red-50" aria-label="Hapus offer">
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-600">
                      <span>Kualitas {offer.qualityScore}/5</span>
                      <span>Kapasitas {formatNumber(offer.capacity)}</span>
                      <span>Min. {formatNumber(offer.minimumOrder)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <FormModal open={supplierModalOpen} title={supplierForm.id ? "Edit Supplier" : "Tambah Supplier"} onClose={() => setSupplierModalOpen(false)}>
        <form onSubmit={submitSupplier} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Kode<input value={supplierForm.code} onChange={(event) => setSupplierForm({ ...supplierForm, code: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Nama<input value={supplierForm.name} onChange={(event) => setSupplierForm({ ...supplierForm, name: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Alamat<input value={supplierForm.address} onChange={(event) => setSupplierForm({ ...supplierForm, address: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Kontak<input value={supplierForm.contact} onChange={(event) => setSupplierForm({ ...supplierForm, contact: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Telepon<input value={supplierForm.phone} onChange={(event) => setSupplierForm({ ...supplierForm, phone: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Email<input value={supplierForm.email} onChange={(event) => setSupplierForm({ ...supplierForm, email: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Jarak (km)<input type="number" value={supplierForm.distance} onChange={(event) => setSupplierForm({ ...supplierForm, distance: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Status<select value={supplierForm.status} onChange={(event) => setSupplierForm({ ...supplierForm, status: event.target.value })} className={inputClass}><option>Aktif</option><option>Evaluasi</option><option>Tidak Aktif</option></select></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setSupplierModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Simpan Supplier</button>
          </div>
        </form>
      </FormModal>

      <FormModal open={offerModalOpen} title={offerForm.id ? "Edit Offer Supplier" : "Tambah Offer Supplier"} onClose={() => setOfferModalOpen(false)}>
        <form onSubmit={submitOffer} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Bahan Baku<select value={offerForm.rawMaterialId} onChange={(event) => selectOfferMaterial(event.target.value)} className={inputClass}>{rawMaterials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Harga<input type="number" value={offerForm.price} onChange={(event) => setOfferForm({ ...offerForm, price: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Kualitas 1-5<input type="number" min="1" max="5" step="0.1" value={offerForm.qualityScore} onChange={(event) => setOfferForm({ ...offerForm, qualityScore: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Kapasitas<input type="number" value={offerForm.capacity} onChange={(event) => setOfferForm({ ...offerForm, capacity: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Jarak (km)<input type="number" value={offerForm.distance} onChange={(event) => setOfferForm({ ...offerForm, distance: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Minimum Order<input type="number" value={offerForm.minimumOrder} onChange={(event) => setOfferForm({ ...offerForm, minimumOrder: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Lead Time (hari)<input type="number" value={offerForm.leadTime} onChange={(event) => setOfferForm({ ...offerForm, leadTime: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Unit<input value={offerForm.unit} onChange={(event) => setOfferForm({ ...offerForm, unit: event.target.value })} className={inputClass} required /></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOfferModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Simpan Offer</button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.type === "supplier" ? "Hapus supplier?" : "Hapus offer supplier?"}
        description="Data akan dihapus dari simulasi."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRecord(deleteTarget.type === "supplier" ? "suppliers" : "supplierOffers", deleteTarget.data.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
