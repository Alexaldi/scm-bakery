import EmptyState from "./empty-state";

export default function DataTableWrapper({ children, empty, className = "" }) {
  if (empty) {
    return <EmptyState title="Data tidak ditemukan" description="Coba ubah kata kunci atau filter yang digunakan." />;
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
