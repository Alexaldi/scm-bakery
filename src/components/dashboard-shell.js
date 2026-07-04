"use client";

import { useState } from "react";
import DashboardSidebar from "./dashboard-sidebar";
import DashboardTopbar from "./dashboard-topbar";
import MobileSidebar from "./mobile-sidebar";
import NotificationToast from "./notification-toast";

export default function DashboardShell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <DashboardSidebar />
      </div>
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-72">
        <DashboardTopbar onToggleSidebar={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 lg:px-6">{children}</main>
      </div>
      <NotificationToast />
    </div>
  );
}
