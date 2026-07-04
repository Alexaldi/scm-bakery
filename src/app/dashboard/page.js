"use client";

import { BarChart3, ClipboardList, Factory, Package, PackageCheck, Truck, Users, Warehouse } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "@/components/page-header";
import ProcessFlow from "@/components/process-flow";
import StatCard from "@/components/stat-card";
import StatusBadge from "@/components/status-badge";
import { useScm } from "@/context/scm-context";
import { formatNumber, formatPeriod, stockStatus } from "@/lib/utils/format";

export default function DashboardPage() {
  const {
    products,
    rawMaterials,
    suppliers,
    inventories,
    purchaseOrders,
    productionOrders,
    distributions,
    monthlySales,
    inventoryMovements,
    procurementPlans,
  } = useScm();

  const rawInventory = inventories.filter((item) => item.itemType === "raw-material");
  const lowStockCount = rawInventory.filter((item) => stockStatus(item.currentStock, item.safetyStock) !== "Aman").length;
  const activePoCount = purchaseOrders.filter((po) => !["Selesai", "Dibatalkan"].includes(po.status)).length;
  const productionProgressCount = productionOrders.filter((order) =>
    ["Bahan Disiapkan", "Diproses"].includes(order.status)
  ).length;
  const pendingDistributionCount = distributions.filter((item) =>
    ["Dijadwalkan", "Dikemas", "Dikirim"].includes(item.status)
  ).length;

  const salesChart = monthlySales.reduce((result, sale) => {
    const existing = result.find((item) => item.period === sale.period);
    if (existing) {
      existing.quantity += Number(sale.quantity || 0);
      return result;
    }

    return [...result, { period: sale.period, label: formatPeriod(sale.period).slice(0, 3), quantity: sale.quantity }];
  }, []);

  const procurementStatus = ["Direncanakan", "PO Dibuat", "Selesai"].map((status) => ({
    status,
    total: procurementPlans.filter((plan) => plan.status === status).length,
  }));

  const recentActivities = [
    ...inventoryMovements.slice(0, 3).map((item) => ({
      id: item.id,
      title: `${item.type} stok ${item.reference}`,
      description: `${formatNumber(item.quantity)} ${item.unit} - ${item.notes}`,
      status: item.type,
    })),
    ...purchaseOrders.slice(0, 2).map((po) => ({
      id: po.id,
      title: po.number,
      description: `${po.supplierName} - ${po.status}`,
      status: po.status,
    })),
  ].slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Ringkasan utama alur Supply Chain Management bakery dari penjualan sampai distribusi."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Produk Aktif" value={products.filter((item) => item.status === "Aktif").length} icon={Package} />
        <StatCard title="Bahan Baku" value={rawMaterials.length} icon={Warehouse} tone="gray" />
        <StatCard title="Supplier" value={suppliers.length} icon={Users} tone="blue" />
        <StatCard title="Di Bawah Safety Stock" value={lowStockCount} icon={PackageCheck} tone="amber" />
        <StatCard title="Purchase Order Aktif" value={activePoCount} icon={ClipboardList} tone="blue" />
        <StatCard title="Produksi Berjalan" value={productionProgressCount} icon={Factory} tone="green" />
        <StatCard title="Distribusi Pending" value={pendingDistributionCount} icon={Truck} tone="amber" />
        <StatCard title="Total Penjualan 12 Bulan" value={formatNumber(monthlySales.reduce((total, sale) => total + sale.quantity, 0))} icon={BarChart3} />
      </div>

      <div className="mt-6">
        <ProcessFlow />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Penjualan Bulanan</h2>
            <p className="text-sm text-gray-500">Total unit terjual dari seluruh produk.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                <Tooltip formatter={(value) => [`${formatNumber(value)} pcs`, "Penjualan"]} />
                <Line type="monotone" dataKey="quantity" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-gray-900">Status Pengadaan</h2>
            <p className="text-sm text-gray-500">Jumlah rencana berdasarkan status.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procurementStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {procurementStatus.map((entry) => (
                    <Cell key={entry.status} fill={entry.status === "Selesai" ? "#16a34a" : "#2563eb"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Aktivitas Terbaru</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-500">{activity.description}</p>
              </div>
              <StatusBadge status={activity.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
