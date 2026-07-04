"use client";

import { X } from "lucide-react";

export default function FormModal({
  open,
  title,
  description,
  children,
  onClose,
  footer,
  size = "max-w-2xl",
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4">
      <div className={`max-h-[90vh] w-full overflow-hidden rounded-lg bg-white shadow-lg ${size}`}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="max-h-[calc(90vh-9rem)] overflow-y-auto p-5">{children}</div>
        {footer ? <div className="border-t border-gray-200 bg-gray-50 p-4">{footer}</div> : null}
      </div>
    </div>
  );
}
