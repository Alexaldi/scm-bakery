"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useScm } from "@/context/scm-context";

export default function NotificationToast() {
  const { toast, setToast } = useScm();

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [setToast, toast]);

  if (!toast) {
    return null;
  }

  const Icon = toast.type === "error" ? XCircle : toast.type === "info" ? Info : CheckCircle2;
  const tone =
    toast.type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : toast.type === "info"
        ? "border-blue-200 bg-blue-50 text-blue-800"
        : "border-green-200 bg-green-50 text-green-800";

  return (
    <div className="fixed bottom-5 right-5 z-[60] w-[min(24rem,calc(100vw-2rem))]">
      <div className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg ${tone}`}>
        <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={() => setToast(null)}
          className="rounded-md p-1 hover:bg-white/60"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
