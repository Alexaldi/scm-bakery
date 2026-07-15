"use client";

import { Bell, LogOut, Menu, UserCircle } from "lucide-react";
import { useState } from "react";
import { logoutAction } from "@/app/login/actions";
import { useScm } from "@/context/scm-context";
import { formatDate } from "@/lib/utils/format";

export default function DashboardTopbar({ onToggleSidebar }) {
  const { role, session, notifications, markNotificationsRead } = useScm();
  const [openNotifications, setOpenNotifications] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 lg:hidden"
            aria-label="Buka menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">Sistem Informasi SCM Bakery</p>
            <p className="text-xs text-gray-500">Prototype alur bisnis akademik</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setOpenNotifications((open) => !open);
                markNotificationsRead();
              }}
              className="relative rounded-md border border-gray-300 p-2 text-gray-700 hover:bg-gray-50"
              aria-label="Buka notifikasi"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] font-semibold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {openNotifications ? (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-200 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">Notifikasi</p>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.slice(0, 6).map((notification) => (
                    <div key={notification.id} className="border-b border-gray-100 px-4 py-3 last:border-b-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="mt-1 text-xs text-gray-600">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{formatDate(notification.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden items-center gap-2 rounded-md border border-gray-200 px-3 py-2 md:flex">
            <UserCircle className="h-5 w-5 text-gray-500" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-gray-900">{session?.name || "Pengguna"}</p>
              <p className="text-[11px] text-gray-500">{role}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
