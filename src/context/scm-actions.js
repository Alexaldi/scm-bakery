"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

const DASHBOARD_PATH = "/dashboard";

function number(value) {
  return Number(value || 0);
}

function monthDate(value) {
  return new Date(`${value || "2026-07"}-01T00:00:00.000Z`);
}

function dateOnly(value) {
  return new Date(`${value || new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
}

function recordStatus(value) {
  return value === "Tidak Aktif" || value === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

function statusLabel(value) {
  return value === "INACTIVE" ? "Tidak Aktif" : "Aktif";
}

function fail(error, fallback = "Data gagal disimpan.") {
  if (error?.code === "P2002") {
    return { ok: false, message: "Kode atau nomor sudah digunakan." };
  }

  if (error?.code === "P2025") {
    return { ok: false, message: "Data tidak ditemukan." };
  }

  console.error(error);
  return { ok: false, message: fallback };
}

async function authorize(roles) {
  try {
    await requireRole(roles);
    return null;
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

function touch() {
  revalidatePath(DASHBOARD_PATH);
}

function mapRawMaterial(material) {
  return {
    id: material.id,
    code: material.code,
    name: material.name,
    category: material.category,
    inventoryUnit: material.inventoryUnit,
    currentStock: number(material.inventory?.currentStock),
    safetyStock: number(material.inventory?.safetyStock),
    minimumStock: number(material.inventory?.minimumStock),
    warehouseLocation: material.warehouseLocation,
    status: statusLabel(material.status),
  };
}

function mapCustomer(customer) {
  return {
    id: customer.id,
    code: customer.code,
    name: customer.name,
    type: customer.customerType,
    region: customer.region,
    contact: customer.contactPerson,
    phone: customer.phone,
    address: customer.address,
    status: statusLabel(customer.status),
  };
}

function mapBom(item) {
  return {
    id: item.id,
    productId: item.productId,
    rawMaterialId: item.rawMaterialId,
    quantityPerProduct: number(item.quantityPerProduct),
    usageUnit: item.usageUnit,
    inventoryUnit: item.inventoryUnit,
    conversionFactor: number(item.conversionFactor),
  };
}

function mapSale(sale) {
  return {
    id: sale.id,
    productId: sale.productId,
    period: sale.period.toISOString().slice(0, 7),
    quantity: sale.quantitySold,
    channel: "Semua",
  };
}

function mapSupplier(supplier) {
  return {
    id: supplier.id,
    code: supplier.code,
    name: supplier.name,
    address: supplier.address,
    contact: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email || "",
    distance: number(supplier.distanceKm),
    status: statusLabel(supplier.status),
  };
}

function mapSupplierOffer(offer) {
  return {
    id: offer.id,
    supplierId: offer.supplierId,
    rawMaterialId: offer.rawMaterialId,
    price: number(offer.price),
    qualityScore: offer.qualityScore,
    capacity: number(offer.capacity),
    distance: number(offer.supplier?.distanceKm),
    minimumOrder: number(offer.minimumOrder),
    leadTime: offer.leadTimeDays,
    unit: offer.unit,
  };
}

export async function saveRawMaterialAction(input) {
  const authError = await authorize(["Administrator", "PPIC", "Gudang", "Purchasing"]);
  if (authError) return authError;

  if (!input?.code || !input?.name || !input?.inventoryUnit) {
    return { ok: false, message: "Kode, nama, dan unit bahan wajib diisi." };
  }

  try {
    const data = {
      code: String(input.code).trim().toUpperCase(),
      name: String(input.name).trim(),
      category: String(input.category || "").trim(),
      inventoryUnit: String(input.inventoryUnit).trim(),
      warehouseLocation: String(input.warehouseLocation || "").trim(),
      status: recordStatus(input.status),
    };

    const inventory = {
      currentStock: number(input.currentStock),
      safetyStock: number(input.safetyStock),
      minimumStock: number(input.minimumStock),
      incomingQuantity: 0,
      outgoingQuantity: 0,
    };

    const material = await prisma.$transaction(async (tx) => {
      const saved = input.id
        ? await tx.rawMaterial.update({ where: { id: input.id }, data })
        : await tx.rawMaterial.create({ data });

      await tx.rawMaterialInventory.upsert({
        where: { rawMaterialId: saved.id },
        update: inventory,
        create: { rawMaterialId: saved.id, ...inventory },
      });

      return tx.rawMaterial.findUnique({ where: { id: saved.id }, include: { inventory: true } });
    });

    touch();
    return { ok: true, message: "Bahan baku berhasil disimpan.", record: mapRawMaterial(material) };
  } catch (error) {
    return fail(error, "Bahan baku gagal disimpan.");
  }
}

export async function saveCustomerAction(input) {
  const authError = await authorize(["Administrator", "Distribusi"]);
  if (authError) return authError;

  if (!input?.code || !input?.name) {
    return { ok: false, message: "Kode dan nama pelanggan wajib diisi." };
  }

  try {
    const data = {
      code: String(input.code).trim().toUpperCase(),
      name: String(input.name).trim(),
      customerType: String(input.type || "Retail").trim(),
      contactPerson: String(input.contact || "").trim(),
      phone: String(input.phone || "").trim(),
      address: String(input.address || "").trim(),
      region: String(input.region || "").trim(),
      status: recordStatus(input.status),
    };

    const customer = input.id
      ? await prisma.customer.update({ where: { id: input.id }, data })
      : await prisma.customer.create({ data });

    touch();
    return { ok: true, message: "Pelanggan berhasil disimpan.", record: mapCustomer(customer) };
  } catch (error) {
    return fail(error, "Pelanggan gagal disimpan.");
  }
}

export async function saveSupplierAction(input) {
  const authError = await authorize(["Administrator", "Purchasing"]);
  if (authError) return authError;

  if (!input?.code || !input?.name) {
    return { ok: false, message: "Kode dan nama supplier wajib diisi." };
  }

  try {
    const data = {
      code: String(input.code).trim().toUpperCase(),
      name: String(input.name).trim(),
      contactPerson: String(input.contact || "").trim(),
      phone: String(input.phone || "").trim(),
      email: input.email ? String(input.email).trim() : null,
      address: String(input.address || "").trim(),
      distanceKm: number(input.distance),
      status: recordStatus(input.status),
    };

    const supplier = input.id
      ? await prisma.supplier.update({ where: { id: input.id }, data })
      : await prisma.supplier.create({ data });

    touch();
    return { ok: true, message: "Supplier berhasil disimpan.", record: mapSupplier(supplier) };
  } catch (error) {
    return fail(error, "Supplier gagal disimpan.");
  }
}

export async function saveSupplierOfferAction(input) {
  const authError = await authorize(["Administrator", "Purchasing"]);
  if (authError) return authError;

  if (!input?.supplierId || !input?.rawMaterialId) {
    return { ok: false, message: "Supplier dan bahan baku wajib dipilih." };
  }

  try {
    const data = {
      supplierId: input.supplierId,
      rawMaterialId: input.rawMaterialId,
      price: number(input.price),
      qualityScore: Math.round(number(input.qualityScore)),
      capacity: number(input.capacity),
      minimumOrder: number(input.minimumOrder),
      leadTimeDays: number(input.leadTime),
      unit: String(input.unit || "").trim(),
      status: "ACTIVE",
    };

    const offer = input.id
      ? await prisma.supplierMaterial.update({ where: { id: input.id }, data, include: { supplier: true } })
      : await prisma.supplierMaterial.create({ data, include: { supplier: true } });

    touch();
    return { ok: true, message: "Offer supplier berhasil disimpan.", record: mapSupplierOffer(offer) };
  } catch (error) {
    return fail(error, "Offer supplier gagal disimpan.");
  }
}

export async function saveBomItemAction(input) {
  const authError = await authorize(["Administrator", "PPIC", "Produksi"]);
  if (authError) return authError;

  if (!input?.productId || !input?.rawMaterialId) {
    return { ok: false, message: "Produk dan bahan baku BOM wajib dipilih." };
  }

  try {
    const data = {
      productId: input.productId,
      rawMaterialId: input.rawMaterialId,
      quantityPerProduct: number(input.quantityPerProduct),
      usageUnit: String(input.usageUnit || "").trim(),
      inventoryUnit: String(input.inventoryUnit || "").trim(),
      conversionFactor: number(input.conversionFactor || 1),
    };

    const item = input.id
      ? await prisma.billOfMaterial.update({ where: { id: input.id }, data })
      : await prisma.billOfMaterial.create({ data });

    touch();
    return { ok: true, message: "Item BOM berhasil disimpan.", record: mapBom(item) };
  } catch (error) {
    return fail(error, "Item BOM gagal disimpan.");
  }
}

export async function saveMonthlySaleAction(input) {
  const authError = await authorize(["Administrator", "PPIC"]);
  if (authError) return authError;

  if (!input?.productId || !input?.period) {
    return { ok: false, message: "Produk dan periode penjualan wajib diisi." };
  }

  const quantitySold = Number(input.quantity);
  if (!Number.isInteger(quantitySold) || quantitySold < 0) {
    return { ok: false, message: "Jumlah penjualan harus bilangan bulat nol atau lebih." };
  }

  try {
    const period = monthDate(input.period);
    const sale = input.id
      ? await prisma.sale.update({ where: { id: input.id }, data: { productId: input.productId, period, quantitySold } })
      : await prisma.sale.upsert({
          where: { productId_period: { productId: input.productId, period } },
          update: { quantitySold },
          create: { productId: input.productId, period, quantitySold },
        });

    touch();
    return { ok: true, message: "Penjualan berhasil disimpan.", record: mapSale(sale) };
  } catch (error) {
    return fail(error, "Penjualan gagal disimpan.");
  }
}

export async function deleteRecordAction(collectionName, id) {
  const deleteRoles = {
    rawMaterials: ["Administrator", "PPIC", "Gudang", "Purchasing"],
    customers: ["Administrator", "Distribusi"],
    bom: ["Administrator", "PPIC", "Produksi"],
    monthlySales: ["Administrator", "PPIC"],
    suppliers: ["Administrator", "Purchasing"],
    supplierOffers: ["Administrator", "Purchasing"],
  };
  const authError = await authorize(deleteRoles[collectionName] || ["Administrator"]);
  if (authError) return authError;

  if (!id) {
    return { ok: false, message: "Data tidak ditemukan." };
  }

  try {
    if (collectionName === "rawMaterials") {
      await prisma.rawMaterial.update({ where: { id }, data: { status: "INACTIVE" } });
    } else if (collectionName === "customers") {
      await prisma.customer.update({ where: { id }, data: { status: "INACTIVE" } });
    } else if (collectionName === "bom") {
      await prisma.billOfMaterial.delete({ where: { id } });
    } else if (collectionName === "monthlySales") {
      await prisma.sale.delete({ where: { id } });
    } else if (collectionName === "suppliers") {
      await prisma.supplier.update({ where: { id }, data: { status: "INACTIVE" } });
    } else if (collectionName === "supplierOffers") {
      await prisma.supplierMaterial.update({ where: { id }, data: { status: "INACTIVE" } });
    } else {
      return { ok: false, message: "Aksi hapus belum tersedia untuk data ini." };
    }

    touch();
    return { ok: true, message: "Data berhasil diperbarui." };
  } catch (error) {
    return fail(error, "Data gagal dihapus.");
  }
}

export async function saveForecastAction(input) {
  const authError = await authorize(["Administrator", "PPIC"]);
  if (authError) return authError;

  if (!input?.productId || !input?.period) {
    return { ok: false, message: "Peramalan harus memiliki produk dan periode." };
  }

  try {
    const forecast = await prisma.forecast.upsert({
      where: { productId_period: { productId: input.productId, period: monthDate(input.period) } },
      update: {
        historicalPeriods: number(input.historicalPeriods),
        quantity: Math.ceil(number(input.quantity ?? input.predictedQuantity)),
        predictedQuantity: Math.ceil(number(input.predictedQuantity ?? input.quantity)),
        method: input.method || "Regresi Linier",
        status: input.status || "Disetujui",
        calculation: input.calculation || undefined,
      },
      create: {
        productId: input.productId,
        period: monthDate(input.period),
        historicalPeriods: number(input.historicalPeriods),
        quantity: Math.ceil(number(input.quantity ?? input.predictedQuantity)),
        predictedQuantity: Math.ceil(number(input.predictedQuantity ?? input.quantity)),
        method: input.method || "Regresi Linier",
        status: input.status || "Disetujui",
        calculation: input.calculation || undefined,
      },
    });

    touch();
    return {
      ok: true,
      message: "Peramalan berhasil disimpan.",
      record: {
        id: forecast.id,
        productId: forecast.productId,
        period: forecast.period.toISOString().slice(0, 7),
        historicalPeriods: forecast.historicalPeriods,
        quantity: forecast.quantity,
        predictedQuantity: forecast.predictedQuantity,
        method: forecast.method,
        status: forecast.status,
        createdAt: forecast.createdAt.toISOString().slice(0, 10),
        calculation: forecast.calculation,
      },
    };
  } catch (error) {
    return fail(error, "Peramalan gagal disimpan.");
  }
}

export async function replaceMaterialRequirementsAction(items) {
  const authError = await authorize(["Administrator", "PPIC", "Produksi"]);
  if (authError) return authError;

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.materialRequirement.upsert({
          where: { period_rawMaterialId: { period: monthDate(item.period), rawMaterialId: item.rawMaterialId } },
          update: {
            totalGrossRequirement: number(item.totalGrossRequirement),
            inventoryUnit: item.inventoryUnit,
            products: item.products || [],
            status: item.status || "Dihitung",
          },
          create: {
            period: monthDate(item.period),
            rawMaterialId: item.rawMaterialId,
            totalGrossRequirement: number(item.totalGrossRequirement),
            inventoryUnit: item.inventoryUnit,
            products: item.products || [],
            status: item.status || "Dihitung",
          },
        });
      }
    });

    touch();
    return { ok: true, message: "Kebutuhan bahan berhasil disimpan." };
  } catch (error) {
    return fail(error, "Kebutuhan bahan gagal disimpan.");
  }
}

export async function createPurchaseOrderAction(planId) {
  const authError = await authorize(["Administrator", "Purchasing"]);
  if (authError) return authError;

  if (!planId) {
    return { ok: false, message: "Rencana pengadaan tidak ditemukan." };
  }

  try {
    const po = await prisma.$transaction(async (tx) => {
      const plan = await tx.procurementPlan.findUnique({
        where: { id: planId },
        include: { rawMaterial: true, supplier: true },
      });

      if (!plan || number(plan.finalOrderQuantity) <= 0) {
        throw new Error("Rencana pengadaan tidak valid.");
      }

      const count = await tx.purchaseOrder.count();
      const orderDate = new Date();
      const expectedArrivalDate = new Date(orderDate);
      expectedArrivalDate.setDate(orderDate.getDate() + 3);

      const saved = await tx.purchaseOrder.create({
        data: {
          number: `PO-${orderDate.getFullYear()}-${String(count + 1).padStart(4, "0")}`,
          supplierId: plan.selectedSupplierId,
          procurementPlanId: plan.id,
          orderDate,
          expectedArrivalDate,
          status: "Draft",
          notes: "PO dari rencana pengadaan.",
          items: {
            create: {
              rawMaterialId: plan.rawMaterialId,
              quantity: plan.finalOrderQuantity,
              unit: plan.inventoryUnit,
              unitPrice: plan.unitPrice,
            },
          },
        },
        include: { supplier: true, items: { include: { rawMaterial: true } } },
      });

      await tx.procurementPlan.update({ where: { id: plan.id }, data: { status: "PO Dibuat" } });
      return saved;
    });

    touch();
    return {
      ok: true,
      message: "Purchase Order berhasil dibuat.",
      record: {
        id: po.id,
        number: po.number,
        supplierId: po.supplierId || "",
        supplierName: po.supplier?.name || "-",
        orderDate: po.orderDate.toISOString().slice(0, 10),
        expectedArrivalDate: po.expectedArrivalDate.toISOString().slice(0, 10),
        status: po.status,
        notes: po.notes || "",
        items: po.items.map((item) => ({
          id: item.id,
          rawMaterialId: item.rawMaterialId,
          rawMaterialName: item.rawMaterial.name,
          quantity: number(item.quantity),
          unit: item.unit,
          unitPrice: number(item.unitPrice),
        })),
      },
    };
  } catch (error) {
    return fail(error, "Purchase Order gagal dibuat.");
  }
}

export async function createProcurementPlansAction(rows, periodValue) {
  const authError = await authorize(["Administrator", "Purchasing", "PPIC"]);
  if (authError) return authError;

  try {
    const plans = await prisma.$transaction(async (tx) => {
      const savedPlans = [];

      for (const row of rows.filter((item) => number(item.finalOrderQuantity) > 0)) {
        const plan = await tx.procurementPlan.create({
          data: {
            period: monthDate(periodValue || row.period),
            rawMaterialId: row.rawMaterialId,
            selectedSupplierId: row.selectedSupplierId || null,
            selectedOfferId: row.selectedOfferId || null,
            grossRequirement: number(row.grossRequirement),
            currentStock: number(row.currentStock),
            safetyStock: number(row.safetyStock),
            netRequirement: number(row.netRequirement),
            minimumOrder: number(row.minimumOrder),
            finalOrderQuantity: number(row.finalOrderQuantity),
            unitPrice: number(row.unitPrice),
            inventoryUnit: row.inventoryUnit,
            status: "Direncanakan",
          },
          include: { rawMaterial: true, supplier: true, selectedOffer: true },
        });
        savedPlans.push(plan);
      }

      return savedPlans;
    });

    touch();
    return {
      ok: true,
      message: `${plans.length} rencana pengadaan berhasil dibuat.`,
      records: plans.map((plan) => ({
        id: plan.id,
        period: plan.period.toISOString().slice(0, 7),
        rawMaterialId: plan.rawMaterialId,
        rawMaterialName: plan.rawMaterial.name,
        grossRequirement: number(plan.grossRequirement),
        currentStock: number(plan.currentStock),
        safetyStock: number(plan.safetyStock),
        netRequirement: number(plan.netRequirement),
        selectedSupplierId: plan.selectedSupplierId || "",
        selectedOfferId: plan.selectedOfferId || "",
        selectedSupplierName: plan.supplier?.name || "-",
        minimumOrder: number(plan.minimumOrder),
        finalOrderQuantity: number(plan.finalOrderQuantity),
        unitPrice: number(plan.unitPrice),
        inventoryUnit: plan.inventoryUnit,
        status: plan.status,
      })),
    };
  } catch (error) {
    return fail(error, "Rencana pengadaan gagal dibuat.");
  }
}

export async function updatePurchaseOrderStatusAction(poId, status) {
  const authError = await authorize(["Administrator", "Purchasing"]);
  if (authError) return authError;

  try {
    await prisma.purchaseOrder.update({ where: { id: poId }, data: { status } });
    touch();
    return { ok: true, message: `Status PO diubah menjadi ${status}.` };
  } catch (error) {
    return fail(error, "Status PO gagal diperbarui.");
  }
}

export async function saveProductionOrderAction(input) {
  const authError = await authorize(["Administrator", "Produksi", "PPIC"]);
  if (authError) return authError;

  try {
    const count = await prisma.productionOrder.count();
    const order = input.id
      ? await prisma.productionOrder.update({
          where: { id: input.id },
          data: {
            productId: input.productId,
            forecastId: input.forecastId || null,
            targetQuantity: number(input.targetQuantity),
            scheduledDate: dateOnly(input.scheduledDate),
            status: input.status || "Direncanakan",
            actualGoodQuantity: number(input.actualGoodQuantity),
            failedQuantity: number(input.failedQuantity),
            notes: input.notes || null,
          },
        })
      : await prisma.productionOrder.create({
          data: {
            number: input.number || `PROD-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`,
            productId: input.productId,
            forecastId: input.forecastId || null,
            targetQuantity: number(input.targetQuantity),
            scheduledDate: dateOnly(input.scheduledDate),
            status: input.status || "Direncanakan",
            actualGoodQuantity: number(input.actualGoodQuantity),
            failedQuantity: number(input.failedQuantity),
            notes: input.notes || null,
          },
        });

    touch();
    return {
      ok: true,
      message: "Order produksi berhasil disimpan.",
      record: {
        id: order.id,
        number: order.number,
        productId: order.productId,
        forecastId: order.forecastId || "",
        targetQuantity: order.targetQuantity,
        scheduledDate: order.scheduledDate.toISOString().slice(0, 10),
        status: order.status,
        actualGoodQuantity: order.actualGoodQuantity,
        failedQuantity: order.failedQuantity,
        notes: order.notes || "",
      },
    };
  } catch (error) {
    return fail(error, "Order produksi gagal disimpan.");
  }
}

export async function saveDistributionAction(input) {
  const authError = await authorize(["Administrator", "Distribusi"]);
  if (authError) return authError;

  try {
    const count = await prisma.distribution.count();
    const distribution = input.id
      ? await prisma.distribution.update({
          where: { id: input.id },
          data: {
            customerId: input.customerId,
            productId: input.productId,
            quantity: number(input.quantity),
            shipmentDate: dateOnly(input.shipmentDate),
            vehicle: input.vehicle,
            status: input.status || "Dijadwalkan",
            recipientName: input.recipientName,
            recipientPhone: input.recipientPhone,
            notes: input.notes || null,
          },
        })
      : await prisma.distribution.create({
          data: {
            deliveryNoteNumber: input.deliveryNoteNumber || `SJ-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
            customerId: input.customerId,
            productId: input.productId,
            quantity: number(input.quantity),
            shipmentDate: dateOnly(input.shipmentDate),
            vehicle: input.vehicle,
            status: input.status || "Dijadwalkan",
            recipientName: input.recipientName,
            recipientPhone: input.recipientPhone,
            notes: input.notes || null,
          },
        });

    touch();
    return {
      ok: true,
      message: "Distribusi berhasil disimpan.",
      record: {
        id: distribution.id,
        deliveryNoteNumber: distribution.deliveryNoteNumber,
        customerId: distribution.customerId,
        productId: distribution.productId,
        quantity: distribution.quantity,
        shipmentDate: distribution.shipmentDate.toISOString().slice(0, 10),
        vehicle: distribution.vehicle,
        status: distribution.status,
        recipientName: distribution.recipientName,
        recipientPhone: distribution.recipientPhone,
        notes: distribution.notes || "",
      },
    };
  } catch (error) {
    return fail(error, "Distribusi gagal disimpan.");
  }
}

export async function adjustInventoryAction(input) {
  const authError = await authorize(["Administrator", "Gudang", "PPIC"]);
  if (authError) return authError;

  try {
    const quantity = number(input.quantity);
    const signedQuantity = input.movementType === "Keluar" ? -quantity : quantity;

    await prisma.$transaction(async (tx) => {
      if (input.itemType === "raw-material") {
        const inventory = await tx.rawMaterialInventory.findUnique({ where: { rawMaterialId: input.itemId } });
        if (!inventory || number(inventory.currentStock) + signedQuantity < 0) {
          throw new Error("Stok bahan baku tidak mencukupi.");
        }
        await tx.rawMaterialInventory.update({
          where: { rawMaterialId: input.itemId },
          data: {
            currentStock: { increment: signedQuantity },
            incomingQuantity: input.movementType === "Masuk" ? { increment: quantity } : undefined,
            outgoingQuantity: input.movementType === "Keluar" ? { increment: quantity } : undefined,
          },
        });
      } else {
        const inventory = await tx.finishedProductInventory.findUnique({ where: { productId: input.itemId } });
        if (!inventory || number(inventory.currentStock) + signedQuantity < 0) {
          throw new Error("Stok produk jadi tidak mencukupi.");
        }
        await tx.finishedProductInventory.update({
          where: { productId: input.itemId },
          data: { currentStock: { increment: signedQuantity } },
        });
      }

      await tx.inventoryMovement.create({
        data: {
          movementDate: new Date(),
          itemType: input.itemType,
          rawMaterialId: input.itemType === "raw-material" ? input.itemId : null,
          productId: input.itemType === "finished-product" ? input.itemId : null,
          type: input.movementType,
          quantity,
          unit: input.unit,
          reference: input.reference || "Penyesuaian",
          notes: input.notes || "Penyesuaian stok.",
        },
      });
    });

    touch();
    return { ok: true, message: "Penyesuaian stok berhasil disimpan." };
  } catch (error) {
    return fail(error, error.message || "Penyesuaian stok gagal disimpan.");
  }
}

export async function confirmReceivingAction(input) {
  const authError = await authorize(["Administrator", "Gudang", "Purchasing"]);
  if (authError) return authError;

  try {
    const record = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: input.purchaseOrderId },
        include: { items: true },
      });
      const poItem = po?.items.find((item) => item.rawMaterialId === input.rawMaterialId) || po?.items[0];
      if (!po || !poItem) {
        throw new Error("Purchase Order atau item bahan tidak ditemukan.");
      }

      const receivedQuantity = number(input.receivedQuantity);
      const rejectedQuantity = number(input.rejectedQuantity);
      const prior = await tx.receivingRecord.aggregate({
        where: { purchaseOrderId: po.id, rawMaterialId: poItem.rawMaterialId },
        _sum: { receivedQuantity: true },
      });
      const orderedQuantity = number(poItem.quantity);
      const remaining = Math.max(0, orderedQuantity - number(prior._sum.receivedQuantity));
      if (receivedQuantity <= 0 || receivedQuantity > remaining) {
        throw new Error("Qty diterima tidak valid.");
      }

      const saved = await tx.receivingRecord.create({
        data: {
          purchaseOrderId: po.id,
          deliveryOrderNumber: input.deliveryOrderNumber,
          receivedDate: dateOnly(input.receivedDate),
          rawMaterialId: poItem.rawMaterialId,
          orderedQuantity,
          receivedQuantity,
          rejectedQuantity,
          unit: input.unit || poItem.unit,
          qualityResult: input.qualityResult,
          notes: input.notes || null,
          status: "Dikonfirmasi",
        },
        include: { purchaseOrder: true },
      });

      await tx.rawMaterialInventory.update({
        where: { rawMaterialId: poItem.rawMaterialId },
        data: {
          currentStock: { increment: receivedQuantity },
          incomingQuantity: { increment: receivedQuantity },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          movementDate: saved.receivedDate,
          itemType: "raw-material",
          rawMaterialId: poItem.rawMaterialId,
          type: "Masuk",
          quantity: receivedQuantity,
          unit: saved.unit,
          reference: saved.deliveryOrderNumber,
          notes: "Penerimaan bahan dari Purchase Order.",
        },
      });

      await tx.purchaseOrder.update({
        where: { id: po.id },
        data: { status: number(prior._sum.receivedQuantity) + receivedQuantity >= orderedQuantity ? "Selesai" : "Diterima Sebagian" },
      });

      return saved;
    });

    touch();
    return {
      ok: true,
      message: "Penerimaan bahan dikonfirmasi dan stok otomatis bertambah.",
      record: {
        id: record.id,
        purchaseOrderId: record.purchaseOrderId,
        poNumber: record.purchaseOrder.number,
        deliveryOrderNumber: record.deliveryOrderNumber,
        receivedDate: record.receivedDate.toISOString().slice(0, 10),
        rawMaterialId: record.rawMaterialId,
        orderedQuantity: number(record.orderedQuantity),
        receivedQuantity: number(record.receivedQuantity),
        rejectedQuantity: number(record.rejectedQuantity),
        unit: record.unit,
        qualityResult: record.qualityResult,
        notes: record.notes || "",
        status: record.status,
      },
    };
  } catch (error) {
    return fail(error, error.message || "Penerimaan bahan gagal dikonfirmasi.");
  }
}

export async function updateProductionStatusAction(orderId, status) {
  const authError = await authorize(["Administrator", "Produksi", "PPIC"]);
  if (authError) return authError;

  try {
    await prisma.productionOrder.update({ where: { id: orderId }, data: { status } });
    touch();
    return { ok: true, message: `Status produksi diubah menjadi ${status}.` };
  } catch (error) {
    return fail(error, "Status produksi gagal diperbarui.");
  }
}

export async function completeProductionAction(orderId, actualGoodQuantity, failedQuantity) {
  const authError = await authorize(["Administrator", "Produksi", "PPIC"]);
  if (authError) return authError;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.productionOrder.findUnique({ where: { id: orderId } });
      if (!order || order.status === "Selesai") {
        throw new Error("Order produksi tidak valid.");
      }

      const bom = await tx.billOfMaterial.findMany({ where: { productId: order.productId } });
      for (const item of bom) {
        const required = number(order.targetQuantity) * number(item.quantityPerProduct) * number(item.conversionFactor);
        const inventory = await tx.rawMaterialInventory.findUnique({ where: { rawMaterialId: item.rawMaterialId } });
        if (!inventory || number(inventory.currentStock) < required) {
          throw new Error("Stok bahan baku tidak mencukupi.");
        }
      }

      for (const item of bom) {
        const required = number(order.targetQuantity) * number(item.quantityPerProduct) * number(item.conversionFactor);
        await tx.rawMaterialInventory.update({
          where: { rawMaterialId: item.rawMaterialId },
          data: {
            currentStock: { decrement: required },
            outgoingQuantity: { increment: required },
          },
        });
        await tx.inventoryMovement.create({
          data: {
            movementDate: new Date(),
            itemType: "raw-material",
            rawMaterialId: item.rawMaterialId,
            type: "Keluar",
            quantity: required,
            unit: item.inventoryUnit,
            reference: order.number,
            notes: "Pemakaian bahan untuk produksi.",
          },
        });
      }

      await tx.finishedProductInventory.update({
        where: { productId: order.productId },
        data: { currentStock: { increment: number(actualGoodQuantity) } },
      });
      await tx.inventoryMovement.create({
        data: {
          movementDate: new Date(),
          itemType: "finished-product",
          productId: order.productId,
          type: "Masuk",
          quantity: number(actualGoodQuantity),
          unit: "pcs",
          reference: order.number,
          notes: "Produk jadi hasil produksi.",
        },
      });
      await tx.productionOrder.update({
        where: { id: order.id },
        data: {
          status: "Selesai",
          actualGoodQuantity: number(actualGoodQuantity),
          failedQuantity: number(failedQuantity),
        },
      });
    });

    touch();
    return { ok: true, message: "Produksi selesai. Bahan baku berkurang dan stok produk jadi bertambah." };
  } catch (error) {
    return fail(error, error.message || "Produksi gagal diselesaikan.");
  }
}

export async function updateDistributionStatusAction(distributionId, status) {
  const authError = await authorize(["Administrator", "Distribusi"]);
  if (authError) return authError;

  try {
    await prisma.distribution.update({ where: { id: distributionId }, data: { status } });
    touch();
    return { ok: true, message: `Status distribusi diubah menjadi ${status}.` };
  } catch (error) {
    return fail(error, "Status distribusi gagal diperbarui.");
  }
}

export async function confirmDistributionShipmentAction(distributionId) {
  const authError = await authorize(["Administrator", "Distribusi"]);
  if (authError) return authError;

  try {
    await prisma.$transaction(async (tx) => {
      const distribution = await tx.distribution.findUnique({ where: { id: distributionId } });
      if (!distribution || ["Dikirim", "Diterima", "Dibatalkan"].includes(distribution.status)) {
        throw new Error("Distribusi tidak valid.");
      }

      const inventory = await tx.finishedProductInventory.findUnique({ where: { productId: distribution.productId } });
      if (!inventory || number(inventory.currentStock) < distribution.quantity) {
        throw new Error("Stok produk jadi tidak mencukupi.");
      }

      await tx.finishedProductInventory.update({
        where: { productId: distribution.productId },
        data: { currentStock: { decrement: distribution.quantity } },
      });
      await tx.inventoryMovement.create({
        data: {
          movementDate: new Date(),
          itemType: "finished-product",
          productId: distribution.productId,
          type: "Keluar",
          quantity: distribution.quantity,
          unit: "pcs",
          reference: distribution.deliveryNoteNumber,
          notes: "Pengeluaran produk jadi untuk distribusi.",
        },
      });
      await tx.distribution.update({ where: { id: distribution.id }, data: { status: "Dikirim" } });
    });

    touch();
    return { ok: true, message: "Pengiriman dikonfirmasi dan stok produk jadi berkurang." };
  } catch (error) {
    return fail(error, error.message || "Pengiriman gagal dikonfirmasi.");
  }
}

export async function addNotificationAction(title, message) {
  const authError = await authorize([]);
  if (authError) return authError;

  try {
    const notification = await prisma.notification.create({ data: { title, message } });
    touch();
    return {
      ok: true,
      record: {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt.toISOString(),
        read: notification.read,
      },
    };
  } catch (error) {
    return fail(error, "Notifikasi gagal disimpan.");
  }
}

export async function markNotificationsReadAction() {
  const authError = await authorize([]);
  if (authError) return authError;

  try {
    await prisma.notification.updateMany({ where: { read: false }, data: { read: true } });
    touch();
    return { ok: true };
  } catch (error) {
    return fail(error, "Notifikasi gagal diperbarui.");
  }
}
