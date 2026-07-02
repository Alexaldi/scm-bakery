"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Penjualan",
    href: "/dashboard/sales",
  },
  {
    label: "Peramalan",
    href: "/dashboard/forecasts",
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  function checkActiveMenu(href) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">
          SCM Bakery
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Supply Chain Management
        </p>
      </div>

      <nav className="space-y-1 p-4">
        {menuItems.map((menu) => {
          const isActive = checkActiveMenu(menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}