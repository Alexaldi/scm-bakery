"use client";

import { LogIn } from "lucide-react";
import { useActionState } from "react";
import { loginAction } from "./actions";

const inputClass =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="nama@perusahaan.id"
          className={inputClass}
        />
      </label>
      <label className="block text-sm font-medium text-gray-700">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan password"
          className={inputClass}
        />
      </label>
      {state?.message ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        {pending ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
