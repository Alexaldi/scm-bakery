"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/prisma";
import { normalizeProductInput, PRODUCT_STATUSES, serializeProduct } from "./product-validation";

const PRODUCTS_PATH = "/dashboard/master/products";

function errorResult(error) {
  if (error?.code === "P2002") {
    return { ok: false, message: "Kode produk sudah digunakan." };
  }

  if (error?.code === "P2025") {
    return { ok: false, message: "Produk tidak ditemukan." };
  }

  console.error(error);
  return { ok: false, message: "Produk gagal disimpan. Coba lagi beberapa saat." };
}

export async function createProduct(input) {
  const validation = normalizeProductInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    const product = await prisma.product.create({
      data: validation.data,
    });

    revalidatePath(PRODUCTS_PATH);
    return {
      ok: true,
      message: "Produk berhasil ditambahkan.",
      product: serializeProduct(product),
    };
  } catch (error) {
    return errorResult(error);
  }
}

export async function updateProduct(id, input) {
  if (!id) {
    return { ok: false, message: "Produk tidak ditemukan." };
  }

  const validation = normalizeProductInput(input);

  if (!validation.ok) {
    return validation;
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: validation.data,
    });

    revalidatePath(PRODUCTS_PATH);
    return {
      ok: true,
      message: "Produk berhasil diperbarui.",
      product: serializeProduct(product),
    };
  } catch (error) {
    return errorResult(error);
  }
}

export async function changeProductStatus(id, status) {
  if (!id) {
    return { ok: false, message: "Produk tidak ditemukan." };
  }

  if (!PRODUCT_STATUSES.includes(status)) {
    return { ok: false, message: "Status produk tidak valid." };
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: { status },
    });

    revalidatePath(PRODUCTS_PATH);
    return {
      ok: true,
      message: status === "ACTIVE" ? "Produk berhasil diaktifkan." : "Produk berhasil dinonaktifkan.",
      product: serializeProduct(product),
    };
  } catch (error) {
    return errorResult(error);
  }
}
