export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"];

export function productStatusLabel(status) {
  return status === "INACTIVE" ? "Tidak Aktif" : "Aktif";
}

export function normalizeProductInput(input = {}) {
  const code = String(input.code || "").trim().toUpperCase();
  const name = String(input.name || "").trim();
  const category = String(input.category || "").trim();
  const sellingPrice = Number(input.sellingPrice);
  const unit = String(input.unit || "").trim();
  const shelfLifeDays = Number(input.shelfLifeDays);
  const status = PRODUCT_STATUSES.includes(input.status) ? input.status : "";

  if (!code) {
    return { ok: false, message: "Kode produk wajib diisi." };
  }

  if (!name) {
    return { ok: false, message: "Nama produk wajib diisi." };
  }

  if (!category) {
    return { ok: false, message: "Kategori produk wajib diisi." };
  }

  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
    return { ok: false, message: "Harga jual harus berupa angka lebih dari nol." };
  }

  if (!unit) {
    return { ok: false, message: "Unit produk wajib diisi." };
  }

  if (!Number.isInteger(shelfLifeDays) || shelfLifeDays <= 0) {
    return { ok: false, message: "Umur simpan harus berupa bilangan bulat lebih dari nol." };
  }

  if (!status) {
    return { ok: false, message: "Status produk tidak valid." };
  }

  return {
    ok: true,
    data: {
      code,
      name,
      category,
      sellingPrice,
      unit,
      shelfLifeDays,
      status,
    },
  };
}

export function serializeProduct(product) {
  return {
    id: product.id,
    code: product.code,
    name: product.name,
    category: product.category,
    sellingPrice: Number(product.sellingPrice),
    unit: product.unit,
    shelfLifeDays: product.shelfLifeDays,
    status: product.status,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}
