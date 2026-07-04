import { statusTone } from "@/lib/utils/format";

const toneClasses = {
  green: "bg-green-50 text-green-700 ring-green-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
};

export default function StatusBadge({ status }) {
  const tone = statusTone(status);

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        toneClasses[tone] || toneClasses.blue
      }`}
    >
      {status || "-"}
    </span>
  );
}
