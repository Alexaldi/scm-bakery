"use client";

import { X } from "lucide-react";
import DashboardSidebar from "./dashboard-sidebar";

export default function MobileSidebar({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-gray-900/40"
        onClick={onClose}
        aria-label="Tutup sidebar"
      />
      <div className="relative h-full w-72 max-w-[85vw] bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <DashboardSidebar onNavigate={onClose} />
      </div>
    </div>
  );
}
