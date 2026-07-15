import "server-only";

import { connection } from "next/server";
import prisma from "@/lib/db/prisma";

function number(value) {
  return Number(value || 0);
}

function statusLabel(status) {
  return status === "INACTIVE" ? "Tidak Aktif" : "Aktif";
}

function period(value) {
  return value.toISOString().slice(0, 7);
}

function dateOnly(value) {
  return value.toISOString().slice(0, 10);
}

function inventoryRows(rawMaterials, products) {
  return [
    ...rawMaterials.map((material) => ({
      id: material.inventory?.id || `inv-${material.id}`,
      itemType: "raw-material",
      rawMaterialId: material.id,
      productId: "",
      currentStock: number(material.inventory?.currentStock),
      safetyStock: number(material.inventory?.safetyStock),
      minimumStock: number(material.inventory?.minimumStock),
      inventoryUnit: material.inventoryUnit,
      warehouseLocation: material.warehouseLocation,
    })),
    ...products.map((product) => ({
      id: product.inventory?.id || `inv-${product.id}`,
      itemType: "finished-product",
      rawMaterialId: "",
      productId: product.id,
      currentStock: number(product.inventory?.currentStock),
      safetyStock: 0,
      minimumStock: 0,
      inventoryUnit: product.unit,
      warehouseLocation: "Gudang Produk Jadi",
    })),
  ];
}

export async function getScmData() {
  await connection();

  const [
    products,
    rawMaterials,
    bom,
    suppliers,
    supplierOffers,
    customers,
    monthlySales,
    forecasts,
    materialRequirements,
    inventoryMovements,
    procurementPlans,
    purchaseOrders,
    receivingRecords,
    productionOrders,
    distributions,
    notifications,
  ] = await prisma.$transaction([
    prisma.product.findMany({ include: { inventory: true }, orderBy: { code: "asc" } }),
    prisma.rawMaterial.findMany({ where: { status: "ACTIVE" }, include: { inventory: true }, orderBy: { code: "asc" } }),
    prisma.billOfMaterial.findMany({ orderBy: [{ productId: "asc" }, { rawMaterialId: "asc" }] }),
    prisma.supplier.findMany({ where: { status: "ACTIVE" }, orderBy: { code: "asc" } }),
    prisma.supplierMaterial.findMany({
      where: { status: "ACTIVE", supplier: { status: "ACTIVE" }, rawMaterial: { status: "ACTIVE" } },
      include: { supplier: true },
      orderBy: [{ rawMaterialId: "asc" }, { price: "asc" }],
    }),
    prisma.customer.findMany({ where: { status: "ACTIVE" }, orderBy: { code: "asc" } }),
    prisma.sale.findMany({ orderBy: [{ period: "asc" }, { productId: "asc" }] }),
    prisma.forecast.findMany({ orderBy: [{ period: "desc" }, { createdAt: "desc" }] }),
    prisma.materialRequirement.findMany({ include: { rawMaterial: true }, orderBy: [{ period: "desc" }, { rawMaterialId: "asc" }] }),
    prisma.inventoryMovement.findMany({ orderBy: { movementDate: "desc" }, take: 100 }),
    prisma.procurementPlan.findMany({
      include: { rawMaterial: true, supplier: true, selectedOffer: true, purchaseOrder: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      include: { supplier: true, items: { include: { rawMaterial: true } } },
      orderBy: { orderDate: "desc" },
    }),
    prisma.receivingRecord.findMany({
      include: { purchaseOrder: true },
      orderBy: { receivedDate: "desc" },
    }),
    prisma.productionOrder.findMany({ orderBy: { scheduledDate: "desc" } }),
    prisma.distribution.findMany({ orderBy: { shipmentDate: "desc" } }),
    prisma.notification.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  const mappedProducts = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    category: product.category,
    sellingPrice: number(product.sellingPrice),
    unit: product.unit,
    shelfLife: product.shelfLifeDays,
    status: statusLabel(product.status),
    finishedStock: number(product.inventory?.currentStock),
  }));

  const mappedRawMaterials = rawMaterials.map((material) => ({
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
  }));

  return {
    products: mappedProducts,
    rawMaterials: mappedRawMaterials,
    bom: bom.map((item) => ({
      id: item.id,
      productId: item.productId,
      rawMaterialId: item.rawMaterialId,
      quantityPerProduct: number(item.quantityPerProduct),
      usageUnit: item.usageUnit,
      inventoryUnit: item.inventoryUnit,
      conversionFactor: number(item.conversionFactor),
    })),
    suppliers: suppliers.map((supplier) => ({
      id: supplier.id,
      code: supplier.code,
      name: supplier.name,
      address: supplier.address,
      contact: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email || "",
      distance: number(supplier.distanceKm),
      status: statusLabel(supplier.status),
    })),
    supplierOffers: supplierOffers.map((offer) => ({
      id: offer.id,
      supplierId: offer.supplierId,
      rawMaterialId: offer.rawMaterialId,
      price: number(offer.price),
      qualityScore: offer.qualityScore,
      capacity: number(offer.capacity),
      distance: number(offer.supplier.distanceKm),
      minimumOrder: number(offer.minimumOrder),
      leadTime: offer.leadTimeDays,
      unit: offer.unit,
    })),
    customers: customers.map((customer) => ({
      id: customer.id,
      code: customer.code,
      name: customer.name,
      type: customer.customerType,
      region: customer.region,
      contact: customer.contactPerson,
      phone: customer.phone,
      address: customer.address,
      status: statusLabel(customer.status),
    })),
    monthlySales: monthlySales.map((sale) => ({
      id: sale.id,
      productId: sale.productId,
      period: period(sale.period),
      quantity: sale.quantitySold,
      channel: "Semua",
    })),
    forecasts: forecasts.map((forecast) => ({
      id: forecast.id,
      productId: forecast.productId,
      period: period(forecast.period),
      historicalPeriods: forecast.historicalPeriods,
      quantity: forecast.quantity,
      predictedQuantity: forecast.predictedQuantity,
      method: forecast.method,
      status: forecast.status,
      createdAt: dateOnly(forecast.createdAt),
      calculation: forecast.calculation,
    })),
    materialRequirements: materialRequirements.map((item) => ({
      id: item.id,
      period: period(item.period),
      rawMaterialId: item.rawMaterialId,
      rawMaterialName: item.rawMaterial.name,
      inventoryUnit: item.inventoryUnit,
      totalGrossRequirement: number(item.totalGrossRequirement),
      products: item.products || [],
      status: item.status,
    })),
    inventories: inventoryRows(rawMaterials, products),
    inventoryMovements: inventoryMovements.map((movement) => ({
      id: movement.id,
      date: dateOnly(movement.movementDate),
      itemType: movement.itemType,
      itemId: movement.rawMaterialId || movement.productId,
      type: movement.type,
      quantity: number(movement.quantity),
      unit: movement.unit,
      reference: movement.reference || "",
      notes: movement.notes || "",
    })),
    procurementPlans: procurementPlans.map((plan) => ({
      id: plan.id,
      period: period(plan.period),
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
      purchaseOrderId: plan.purchaseOrder?.id,
    })),
    purchaseOrders: purchaseOrders.map((po) => ({
      id: po.id,
      number: po.number,
      supplierId: po.supplierId || "",
      supplierName: po.supplier?.name || "-",
      orderDate: dateOnly(po.orderDate),
      expectedArrivalDate: dateOnly(po.expectedArrivalDate),
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
    })),
    receivingRecords: receivingRecords.map((record) => ({
      id: record.id,
      purchaseOrderId: record.purchaseOrderId,
      poNumber: record.purchaseOrder.number,
      deliveryOrderNumber: record.deliveryOrderNumber,
      receivedDate: dateOnly(record.receivedDate),
      rawMaterialId: record.rawMaterialId,
      orderedQuantity: number(record.orderedQuantity),
      receivedQuantity: number(record.receivedQuantity),
      rejectedQuantity: number(record.rejectedQuantity),
      unit: record.unit,
      qualityResult: record.qualityResult,
      notes: record.notes || "",
      status: record.status,
    })),
    productionOrders: productionOrders.map((order) => ({
      id: order.id,
      number: order.number,
      productId: order.productId,
      forecastId: order.forecastId || "",
      targetQuantity: order.targetQuantity,
      scheduledDate: dateOnly(order.scheduledDate),
      status: order.status,
      actualGoodQuantity: order.actualGoodQuantity,
      failedQuantity: order.failedQuantity,
      notes: order.notes || "",
    })),
    distributions: distributions.map((distribution) => ({
      id: distribution.id,
      deliveryNoteNumber: distribution.deliveryNoteNumber,
      customerId: distribution.customerId,
      productId: distribution.productId,
      quantity: distribution.quantity,
      shipmentDate: dateOnly(distribution.shipmentDate),
      vehicle: distribution.vehicle,
      status: distribution.status,
      recipientName: distribution.recipientName,
      recipientPhone: distribution.recipientPhone,
      notes: distribution.notes || "",
    })),
    notifications: notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt.toISOString(),
      read: notification.read,
    })),
  };
}
