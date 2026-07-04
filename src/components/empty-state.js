import { Inbox } from "lucide-react";

export default function EmptyState({ title = "Data belum tersedia", description, action }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
      <Inbox className="h-9 w-9 text-gray-400" aria-hidden="true" />
      <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
      {description ? <p className="mt-1 max-w-md text-sm text-gray-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
