import {
  BarChart3,
  Boxes,
  ClipboardList,
  Factory,
  FileText,
  Home,
  PackageCheck,
  PackageSearch,
  PanelLeft,
  ReceiptText,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";

export const roles = [
  "Administrator",
  "PPIC",
  "Purchasing",
  "Gudang",
  "Produksi",
  "Distribusi",
];

export const sidebarMenus = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles,
  },
  {
    label: "Master Data",
    icon: PanelLeft,
    roles: ["Administrator", "PPIC", "Purchasing", "Gudang"],
    children: [
      {
        label: "Produk",
        href: "/dashboard/master/products",
        icon: PackageSearch,
        roles: ["Administrator", "PPIC", "Produksi"],
      },
      {
        label: "Bahan Baku",
        href: "/dashboard/master/raw-materials",
        icon: Warehouse,
        roles: ["Administrator", "PPIC", "Gudang", "Purchasing"],
      },
      {
        label: "Bill of Material",
        href: "/dashboard/master/bom",
        icon: ClipboardList,
        roles: ["Administrator", "PPIC", "Produksi"],
      },
      {
        label: "Supplier",
        href: "/dashboard/master/suppliers",
        icon: Users,
        roles: ["Administrator", "Purchasing"],
      },
      {
        label: "Pelanggan",
        href: "/dashboard/master/customers",
        icon: Users,
        roles: ["Administrator", "Distribusi"],
      },
    ],
  },
  {
    label: "Penjualan",
    href: "/dashboard/sales",
    icon: BarChart3,
    roles: ["Administrator", "PPIC"],
  },
  {
    label: "Peramalan Produksi",
    href: "/dashboard/forecasts",
    icon: BarChart3,
    roles: ["Administrator", "PPIC"],
  },
  {
    label: "Kebutuhan Bahan",
    href: "/dashboard/material-requirements",
    icon: Boxes,
    roles: ["Administrator", "PPIC", "Produksi"],
  },
  {
    label: "Persediaan",
    href: "/dashboard/inventory",
    icon: Warehouse,
    roles: ["Administrator", "Gudang", "PPIC"],
  },
  {
    label: "Pemilihan Supplier",
    href: "/dashboard/supplier-selection",
    icon: PackageCheck,
    roles: ["Administrator", "Purchasing"],
  },
  {
    label: "Pengadaan",
    href: "/dashboard/procurement",
    icon: ShoppingCart,
    roles: ["Administrator", "Purchasing", "PPIC"],
  },
  {
    label: "Purchase Order",
    href: "/dashboard/purchase-orders",
    icon: ReceiptText,
    roles: ["Administrator", "Purchasing"],
  },
  {
    label: "Penerimaan Bahan",
    href: "/dashboard/receiving",
    icon: PackageCheck,
    roles: ["Administrator", "Gudang", "Purchasing"],
  },
  {
    label: "Produksi",
    href: "/dashboard/production",
    icon: Factory,
    roles: ["Administrator", "Produksi", "PPIC"],
  },
  {
    label: "Distribusi",
    href: "/dashboard/distribution",
    icon: Truck,
    roles: ["Administrator", "Distribusi"],
  },
  {
    label: "Laporan",
    href: "/dashboard/reports",
    icon: FileText,
    roles,
  },
];

export function canAccessMenu(menu, role) {
  if (role === "Administrator") {
    return true;
  }

  return !menu.roles || menu.roles.includes(role);
}

export function flattenMenus(menus = sidebarMenus) {
  return menus.flatMap((menu) => {
    if (menu.children) {
      return menu.children;
    }

    return menu;
  });
}

export function getPageMeta(pathname) {
  const allMenus = flattenMenus(sidebarMenus);
  const exact = allMenus.find((menu) => menu.href === pathname);

  if (exact) {
    return {
      title: exact.label,
      breadcrumb: ["Dashboard", exact.label],
    };
  }

  return {
    title: "Dashboard",
    breadcrumb: ["Dashboard"],
  };
}
