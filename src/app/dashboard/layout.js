import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
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
          <Link
            href="/dashboard"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/dashboard/sales"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Penjualan
          </Link>

          <Link
            href="/dashboard/forecasts"
            className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Peramalan
          </Link>
        </nav>
      </aside>

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