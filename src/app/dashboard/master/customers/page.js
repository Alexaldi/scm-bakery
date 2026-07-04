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
import { searchText } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const emptyCustomer = {
  code: "",
  name: "",
  type: "Retail",
  region: "",
  contact: "",
  phone: "",
  address: "",
  status: "Aktif",
};

export default function CustomersPage() {
  const { customers, saveRecord, deleteRecord } = useScm();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("Semua");
  const [form, setForm] = useState(emptyCustomer);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const types = useMemo(() => ["Semua", ...new Set(customers.map((customer) => customer.type))], [customers]);
  const filteredCustomers = customers.filter(
    (customer) =>
      searchText(customer, ["code", "name", "region", "contact", "address"], search) &&
      (type === "Semua" || customer.type === type)
  );

  function openCreateModal() {
    setForm({
      ...emptyCustomer,
      code: `CUST-${String(customers.length + 1).padStart(3, "0")}`,
    });
    setModalOpen(true);
  }

  function submitForm(event) {
    event.preventDefault();
    saveRecord("customers", form);
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Pelanggan"
        description="Data pelanggan, outlet, dan distributor untuk simulasi pengiriman produk jadi."
        actions={
          <button type="button" onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah Pelanggan
          </button>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem]">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari pelanggan, kontak, atau wilayah..." />
        <select value={type} onChange={(event) => setType(event.target.value)} className={inputClass}>
          {types.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <DataTableWrapper empty={filteredCustomers.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Kode</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Pelanggan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Kontak</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Wilayah</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipe</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{customer.code}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.address}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  <p>{customer.contact}</p>
                  <p className="text-xs">{customer.phone}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{customer.region}</td>
                <td className="px-4 py-3 text-gray-600">{customer.type}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={customer.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => { setForm(customer); setModalOpen(true); }} className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50" aria-label="Edit pelanggan">
                      <Edit className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setDeleteTarget(customer)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="Hapus pelanggan">
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTableWrapper>

      <FormModal open={modalOpen} title={form.id ? "Edit Pelanggan" : "Tambah Pelanggan"} onClose={() => setModalOpen(false)}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Kode<input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Nama<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Tipe<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className={inputClass}><option>Retail</option><option>Distributor</option><option>HoReCa</option></select></label>
          <label className="text-sm font-medium text-gray-700">Wilayah<input value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Kontak<input value={form.contact} onChange={(event) => setForm({ ...form, contact: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Telepon<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">Alamat<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className={inputClass}><option>Aktif</option><option>Tidak Aktif</option></select></label>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Simpan Pelanggan</button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Hapus pelanggan?"
        description={`Pelanggan ${deleteTarget?.name || ""} akan dihapus dari data demo.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          deleteRecord("customers", deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
