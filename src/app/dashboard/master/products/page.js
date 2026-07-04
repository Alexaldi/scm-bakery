import { connection } from "next/server";
import prisma from "@/lib/db/prisma";
import ProductsClient from "./products-client";
import { serializeProduct } from "./product-validation";

export default async function ProductsPage() {
  await connection();

  const products = await prisma.product.findMany({
    orderBy: [{ code: "asc" }],
  });

  return <ProductsClient initialProducts={products.map(serializeProduct)} />;
}
