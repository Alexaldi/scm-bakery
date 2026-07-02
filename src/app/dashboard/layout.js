import Link from "next/link";
import DashboardSidebar from "@/components/dashboard-sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardSidebar />
      <div className="ml-64">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <div>
            <p className="text-sm text-gray-500">
              Sistem Informasi SCM
            </p>
          </div>

          <div className="text-sm font-medium text-gray-700">
            Administrator
          </div>
        </header>

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}