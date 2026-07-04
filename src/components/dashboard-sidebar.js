"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useScm } from "@/context/scm-context";
import { canAccessMenu, sidebarMenus } from "@/lib/utils/navigation";

function isActivePath(pathname, href) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export default function DashboardSidebar({ onNavigate }) {
  const pathname = usePathname();
  const { role, resetDemoData } = useScm();
  const [masterOpen, setMasterOpen] = useState(pathname.startsWith("/dashboard/master"));

  return (
    <aside className="flex h-full flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-5 py-5">
        <Link href="/dashboard" onClick={onNavigate} className="block">
          <h1 className="text-lg font-semibold text-gray-900">SCM Bakery</h1>
          <p className="mt-1 text-xs text-gray-500">Supply Chain Management</p>
        </Link>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {sidebarMenus
          .filter((menu) => canAccessMenu(menu, role))
          .map((menu) => {
            if (menu.children) {
              const visibleChildren = menu.children.filter((child) => canAccessMenu(child, role));
              if (!visibleChildren.length) {
                return null;
              }

              const GroupIcon = menu.icon;
              const hasActiveChild = visibleChildren.some((child) => isActivePath(pathname, child.href));

              return (
                <div key={menu.label}>
                  <button
                    type="button"
                    onClick={() => setMasterOpen((open) => !open)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition ${
                      hasActiveChild ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <GroupIcon className="h-4 w-4" aria-hidden="true" />
                      {menu.label}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition ${masterOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {masterOpen ? (
                    <div className="mt-1 space-y-1 pl-4">
                      {visibleChildren.map((child) => {
                        const ChildIcon = child.icon;
                        const active = isActivePath(pathname, child.href);

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition ${
                              active ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <ChildIcon className="h-4 w-4" aria-hidden="true" />
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            const Icon = menu.icon;
            const active = isActivePath(pathname, menu.href);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {menu.label}
              </Link>
            );
          })}
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          type="button"
          onClick={resetDemoData}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset Data Demo
        </button>
      </div>
    </aside>
  );
}
