export default function ProductsLoading() {
  return (
    <div>
      <div className="mb-6 h-20 animate-pulse rounded-lg bg-gray-200" />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem_10rem]">
        <div className="h-10 animate-pulse rounded-md bg-gray-200" />
        <div className="h-10 animate-pulse rounded-md bg-gray-200" />
        <div className="h-10 animate-pulse rounded-md bg-gray-200" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="h-80 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-80 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}
