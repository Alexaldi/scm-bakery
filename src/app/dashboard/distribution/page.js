"use client";

import { PackageCheck, Plus, Truck } from "lucide-react";
import { useState } from "react";
import DataTableWrapper from "@/components/data-table-wrapper";
import FormModal from "@/components/form-modal";
import PageHeader from "@/components/page-header";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatDate, formatNumber } from "@/lib/utils/format";

const inputClass =
  "h-10 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function DistributionPage() {
  const {
    distributions,
    customers,
    products,
    inventories,
    saveDistribution,
    updateDistributionStatus,
    confirmDistributionShipment,
  } = useScm();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    customerId: customers[0]?.id || "",
    productId: products[0]?.id || "",
    quantity: 0,
    shipmentDate: "2026-07-05",
    vehicle: "Mobil Box",
    deliveryNoteNumber: "",
    status: "Dijadwalkan",
    recipientName: "",
    recipientPhone: "",
    notes: "Distribusi simulasi",
  });

  function submitForm(event) {
    event.preventDefault();
    saveDistribution(form);
    setModalOpen(false);
  }

  function productStock(productId) {
    return inventories.find((item) => item.itemType === "finished-product" && item.productId === productId)?.currentStock || 0;
  }

  return (
    <div>
      <PageHeader
        title="Distribusi"
        description="Simulasi pengiriman produk jadi ke pelanggan atau distributor. Pengiriman tidak boleh melebihi stok produk jadi tersedia."
        actions={
          <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Jadwalkan Distribusi
          </button>
        }
      />

      <DataTableWrapper empty={distributions.length === 0}>
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Surat Jalan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Pelanggan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Produk</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Qty</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tanggal</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Kendaraan</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {distributions.map((distribution) => {
              const customer = customers.find((item) => item.id === distribution.customerId);
              const product = products.find((item) => item.id === distribution.productId);
              const stock = productStock(distribution.productId);
              return (
                <tr key={distribution.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{distribution.deliveryNoteNumber}</p><p className="text-xs text-gray-500">Penerima {distribution.recipientName}</p></td>
                  <td className="px-4 py-3 text-gray-700">{customer?.name}</td>
                  <td className="px-4 py-3"><p className="text-gray-900">{product?.name}</p><p className="text-xs text-gray-500">Stok {formatNumber(stock)} pcs</p></td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatNumber(distribution.quantity)} pcs</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(distribution.shipmentDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{distribution.vehicle}</td>
                  <td className="px-4 py-3 text-center"><StatusBadge status={distribution.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => updateDistributionStatus(distribution.id, "Dikemas")} className="rounded-md border border-gray-300 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">Kemas</button>
                      <button type="button" onClick={() => confirmDistributionShipment(distribution.id)} className="rounded-md border border-blue-200 px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">Kirim</button>
                      <button type="button" onClick={() => updateDistributionStatus(distribution.id, "Diterima")} className="rounded-md border border-green-200 px-2 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50">Diterima</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataTableWrapper>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <span className="rounded-md bg-blue-50 p-2 text-blue-700"><Truck className="h-5 w-5" aria-hidden="true" /></span>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Aturan Simulasi Distribusi</h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Tombol Kirim memvalidasi stok produk jadi. Jika stok cukup, status berubah menjadi Dikirim dan stok produk jadi otomatis berkurang.
            </p>
          </div>
        </div>
      </section>

      <FormModal open={modalOpen} title="Jadwalkan Distribusi" onClose={() => setModalOpen(false)}>
        <form onSubmit={submitForm} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">Pelanggan<select value={form.customerId} onChange={(event) => { const customer = customers.find((item) => item.id === event.target.value); setForm({ ...form, customerId: event.target.value, recipientName: customer?.contact || form.recipientName, recipientPhone: customer?.phone || form.recipientPhone }); }} className={inputClass}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Produk<select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className={inputClass}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">Qty<input type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Tanggal Kirim<input type="date" value={form.shipmentDate} onChange={(event) => setForm({ ...form, shipmentDate: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Kendaraan / Kurir<input value={form.vehicle} onChange={(event) => setForm({ ...form, vehicle: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Nomor Surat Jalan<input value={form.deliveryNoteNumber} onChange={(event) => setForm({ ...form, deliveryNoteNumber: event.target.value })} placeholder="Otomatis jika kosong" className={inputClass} /></label>
          <label className="text-sm font-medium text-gray-700">Nama Penerima<input value={form.recipientName} onChange={(event) => setForm({ ...form, recipientName: event.target.value })} className={inputClass} required /></label>
          <label className="text-sm font-medium text-gray-700">Telepon Penerima<input value={form.recipientPhone} onChange={(event) => setForm({ ...form, recipientPhone: event.target.value })} className={inputClass} required /></label>
          <div className="md:col-span-2 rounded-md bg-gray-50 p-3 text-sm text-gray-600">Stok produk terpilih saat ini: {formatNumber(productStock(form.productId))} pcs.</div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit" className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><PackageCheck className="h-4 w-4" aria-hidden="true" />Simpan Jadwal</button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
