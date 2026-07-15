import { redirect } from "next/navigation";
import LoginForm from "./login-form";
import { getSession } from "@/lib/auth/session";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <section className="w-full rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">SCM Bakery</p>
          <h1 className="mt-2 text-2xl font-semibold text-gray-900">Login Pengguna</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Masuk sesuai role untuk mengakses alur supply chain bakery.
          </p>
          <LoginForm />
          <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
            Akun seed: admin@scm-bakery.local, ppic@scm-bakery.local,
            purchasing@scm-bakery.local, gudang@scm-bakery.local, produksi@scm-bakery.local,
            distribusi@scm-bakery.local. Password: bakery12345.
          </div>
        </section>
      </div>
    </main>
  );
}
