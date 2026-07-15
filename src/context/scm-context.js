"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  adjustInventoryAction,
  addNotificationAction,
  completeProductionAction,
  confirmDistributionShipmentAction,
  confirmReceivingAction,
  createProcurementPlansAction,
  createPurchaseOrderAction,
  deleteRecordAction,
  replaceMaterialRequirementsAction,
  saveBomItemAction,
  saveCustomerAction,
  saveDistributionAction,
  saveForecastAction,
  saveMonthlySaleAction,
  saveProductionOrderAction,
  saveRawMaterialAction,
  saveSupplierAction,
  saveSupplierOfferAction,
  markNotificationsReadAction,
  updateDistributionStatusAction,
  updatePurchaseOrderStatusAction,
  updateProductionStatusAction,
} from "@/context/scm-actions";
import { calculateMaterialRequirements } from "@/lib/services/material-requirement";
import { calculateProcurementPlanRows } from "@/lib/services/procurement";
import { cloneData, generateId, getNextPeriod } from "@/lib/utils/format";

const ScmContext = createContext(null);

const emptyScmData = {
  products: [],
  rawMaterials: [],
  bom: [],
  suppliers: [],
  supplierOffers: [],
  customers: [],
  monthlySales: [],
  forecasts: [],
  materialRequirements: [],
  inventories: [],
  inventoryMovements: [],
  procurementPlans: [],
  purchaseOrders: [],
  receivingRecords: [],
  productionOrders: [],
  distributions: [],
  notifications: [],
};

function buildMovement({ itemType, itemId, type, quantity, unit, reference, notes }) {
  return {
    id: generateId("mov"),
    date: new Date().toISOString().slice(0, 10),
    itemType,
    itemId,
    type,
    quantity: Number(quantity || 0),
    unit,
    reference,
    notes,
  };
}

function calculatePoTotal(items = []) {
  return items.reduce((total, item) => total + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
}

function isPositiveQuantity(value) {
  return Number.isFinite(Number(value)) && Number(value) > 0;
}

function getInventoryMatcher(itemType, itemId) {
  return (inventory) =>
    inventory.itemType === itemType &&
    (itemType === "raw-material" ? inventory.rawMaterialId === itemId : inventory.productId === itemId);
}

function updateInventoryCollection(inventories, itemType, itemId, quantityDelta) {
  return inventories.map((inventory) => {
    if (!getInventoryMatcher(itemType, itemId)(inventory)) {
      return inventory;
    }

    return {
      ...inventory,
      currentStock: Math.max(0, Number(inventory.currentStock || 0) + Number(quantityDelta || 0)),
    };
  });
}

function syncMasterStock(state, itemType, itemId, quantityDelta) {
  if (itemType === "raw-material") {
    return {
      ...state,
      rawMaterials: state.rawMaterials.map((material) =>
        material.id === itemId
          ? {
              ...material,
              currentStock: Math.max(0, Number(material.currentStock || 0) + Number(quantityDelta || 0)),
            }
          : material
      ),
    };
  }

  return {
    ...state,
    products: state.products.map((product) =>
      product.id === itemId
        ? {
            ...product,
            finishedStock: Math.max(0, Number(product.finishedStock || 0) + Number(quantityDelta || 0)),
          }
        : product
    ),
  };
}

function upsertCollection(collection, record) {
  const exists = collection.some((item) => item.id === record.id);
  return exists ? collection.map((item) => (item.id === record.id ? record : item)) : [record, ...collection];
}

export function ScmProvider({ children, initialData = emptyScmData, session = null }) {
  const [state, setState] = useState(() => initialData);
  const hydrated = true;
  const role = session?.role || "Administrator";
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setState(initialData), 0);
    return () => window.clearTimeout(timeout);
  }, [initialData]);

  function pushToast(message, type = "success") {
    setToast({
      id: generateId("toast"),
      message,
      type,
    });
  }

  function setRole() {
    pushToast("Role mengikuti akun login. Silakan logout untuk mengganti role.", "info");
  }

  async function addNotification(title, message) {
    const result = await addNotificationAction(title, message);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      notifications: [result.record, ...current.notifications],
    }));
  }

  async function saveRecord(collectionName, record) {
    const action =
      collectionName === "customers"
        ? saveCustomerAction
        : collectionName === "suppliers"
          ? saveSupplierAction
          : collectionName === "supplierOffers"
            ? saveSupplierOfferAction
            : null;

    if (!action) {
      pushToast("Penyimpanan database belum tersedia untuk data ini.", "error");
      return;
    }

    const result = await action(record);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      [collectionName]: upsertCollection(current[collectionName] || [], result.record),
    }));
    pushToast(result.message);
  }

  async function deleteRecord(collectionName, id) {
    const result = await deleteRecordAction(collectionName, id);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      [collectionName]: current[collectionName].filter((item) => item.id !== id),
    }));
    pushToast(result.message);
  }

  function saveProduct(product) {
    setState((current) => {
      const id = product.id || generateId("prod");
      const nextProduct = {
        ...product,
        id,
        sellingPrice: Number(product.sellingPrice || 0),
        shelfLife: Number(product.shelfLife || 0),
        finishedStock: Number(product.finishedStock || 0),
      };
      const exists = current.products.some((item) => item.id === id);
      const products = exists
        ? current.products.map((item) => (item.id === id ? nextProduct : item))
        : [nextProduct, ...current.products];
      const inventoryExists = current.inventories.some(
        (inventory) => inventory.itemType === "finished-product" && inventory.productId === id
      );
      const inventories = inventoryExists
        ? current.inventories.map((inventory) =>
            inventory.itemType === "finished-product" && inventory.productId === id
              ? {
                  ...inventory,
                  currentStock: nextProduct.finishedStock,
                  inventoryUnit: nextProduct.unit || "pcs",
                }
              : inventory
          )
        : [
            {
              id: `inv-${id}`,
              itemType: "finished-product",
              rawMaterialId: "",
              productId: id,
              currentStock: nextProduct.finishedStock,
              safetyStock: 100,
              minimumStock: 75,
              inventoryUnit: nextProduct.unit || "pcs",
              warehouseLocation: "Gudang Produk Jadi",
            },
            ...current.inventories,
          ];

      return {
        ...current,
        products,
        inventories,
      };
    });
    pushToast("Data produk berhasil disimpan.");
  }

  async function saveRawMaterial(material) {
    const result = await saveRawMaterialAction(material);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    const nextMaterial = result.record;
    setState((current) => ({
      ...current,
      rawMaterials: upsertCollection(current.rawMaterials, nextMaterial),
      inventories: upsertCollection(current.inventories, {
        id: `inv-${nextMaterial.id}`,
        itemType: "raw-material",
        rawMaterialId: nextMaterial.id,
        productId: "",
        currentStock: nextMaterial.currentStock,
        safetyStock: nextMaterial.safetyStock,
        minimumStock: nextMaterial.minimumStock,
        inventoryUnit: nextMaterial.inventoryUnit,
        warehouseLocation: nextMaterial.warehouseLocation,
      }),
    }));
    pushToast(result.message);
  }

  async function saveBomItem(item) {
    const result = await saveBomItemAction(item);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      bom: upsertCollection(current.bom, result.record),
    }));
    pushToast(result.message);
  }

  async function saveMonthlySale(sale) {
    const result = await saveMonthlySaleAction(sale);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      monthlySales: upsertCollection(current.monthlySales, result.record),
    }));
    pushToast(result.message);
  }

  async function saveForecast(forecast) {
    const productSales = state.monthlySales
      .filter((sale) => sale.productId === forecast.productId)
      .sort((a, b) => a.period.localeCompare(b.period));
    const lastPeriod = productSales.at(-1)?.period || "2026-06";
    const result = await saveForecastAction({
      ...forecast,
      period: forecast.period || getNextPeriod(lastPeriod),
      historicalPeriods: Number(forecast.historicalPeriods || productSales.length),
      quantity: Number(forecast.quantity ?? forecast.predictedQuantity ?? 0),
      predictedQuantity: Number(forecast.predictedQuantity ?? forecast.quantity ?? 0),
      method: "Regresi Linier",
      createdAt: forecast.createdAt || new Date().toISOString().slice(0, 10),
      status: forecast.status || "Disetujui",
    });

    if (!result.ok) {
      pushToast(result.message, "error");
      return null;
    }

    const nextForecasts = upsertCollection(state.forecasts, result.record);
    const requirementResult = calculateMaterialRequirements({
      forecasts: nextForecasts,
      bom: state.bom,
      products: state.products,
      rawMaterials: state.rawMaterials,
    });
    const materialRequirements = requirementResult.aggregated.map((item) => ({
      ...item,
      id: `mr-${item.rawMaterialId}-${result.record.period}`,
      period: result.record.period,
      status: "Dihitung",
    }));

    setState((current) => ({
      ...current,
      forecasts: nextForecasts,
      materialRequirements,
    }));
    replaceMaterialRequirementsAction(materialRequirements).then((saveResult) => {
      if (!saveResult.ok) {
        pushToast(saveResult.message, "error");
      }
    });
    pushToast("Peramalan disimpan dan kebutuhan bahan diperbarui otomatis.");
    return result.record;
  }

  function calculateAndSaveMaterialRequirements() {
    const result = calculateMaterialRequirements({
      forecasts: state.forecasts,
      bom: state.bom,
      products: state.products,
      rawMaterials: state.rawMaterials,
    });

    const period = state.forecasts.find((forecast) => forecast.status === "Disetujui")?.period || "2026-07";
    const materialRequirements = result.aggregated.map((item) => ({
      ...item,
      id: `mr-${item.rawMaterialId}-${period}`,
      period,
      status: "Dihitung",
    }));

    setState((current) => ({
      ...current,
      materialRequirements,
    }));
    replaceMaterialRequirementsAction(materialRequirements).then((saveResult) => {
      if (!saveResult.ok) {
        pushToast(saveResult.message, "error");
      }
    });
    pushToast("Kebutuhan bahan berhasil dihitung dari peramalan dan BOM.");

    return {
      ...result,
      materialRequirements,
    };
  }

  async function createProcurementPlans(rows) {
    const sourceRows =
      rows ||
      calculateProcurementPlanRows({
        materialRequirements: state.materialRequirements,
        inventories: state.inventories,
        rawMaterials: state.rawMaterials,
        suppliers: state.suppliers,
        supplierOffers: state.supplierOffers,
      });
    const period = state.materialRequirements[0]?.period || "2026-07";
    const result = await createProcurementPlansAction(sourceRows.map((row) => ({ ...row, period })), period);

    if (!result.ok) {
      pushToast(result.message, "error");
      return [];
    }

    setState((current) => ({
      ...current,
      procurementPlans: [...result.records, ...current.procurementPlans],
    }));
    pushToast(result.message);
    addNotification("Rencana Pengadaan Dibuat", `${result.records.length} bahan baku siap dikonversi menjadi PO.`);
    return result.records;
  }

  async function createPurchaseOrderFromPlan(planId) {
    const result = await createPurchaseOrderAction(planId);
    if (!result.ok) {
      pushToast(result.message, "error");
      return null;
    }

    setState((current) => ({
      ...current,
      procurementPlans: current.procurementPlans.map((item) =>
        item.id === planId ? { ...item, status: "PO Dibuat", purchaseOrderId: result.record.id } : item
      ),
      purchaseOrders: [result.record, ...current.purchaseOrders],
    }));
    pushToast(result.message);
    return result.record;
  }

  async function updatePurchaseOrderStatus(poId, status) {
    const result = await updatePurchaseOrderStatusAction(poId, status);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      purchaseOrders: current.purchaseOrders.map((po) => (po.id === poId ? { ...po, status } : po)),
    }));
    pushToast(result.message);
  }

  async function adjustInventory({ itemType, itemId, quantity, movementType, unit, reference, notes }) {
    if (!isPositiveQuantity(quantity)) {
      pushToast("Jumlah penyesuaian stok harus lebih besar dari nol.", "error");
      return;
    }

    const inventory = state.inventories.find(getInventoryMatcher(itemType, itemId));
    const signedQuantity = movementType === "Keluar" ? -Number(quantity) : Number(quantity);

    if (!inventory) {
      pushToast("Item inventory tidak ditemukan.", "error");
      return;
    }

    if (Number(inventory.currentStock || 0) + signedQuantity < 0) {
      pushToast("Stok tidak mencukupi untuk transaksi keluar.", "error");
      return;
    }

    const result = await adjustInventoryAction({ itemType, itemId, quantity, movementType, unit: unit || inventory.inventoryUnit, reference, notes });
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => {
      const nextState = syncMasterStock(
        {
          ...current,
          inventories: updateInventoryCollection(current.inventories, itemType, itemId, signedQuantity),
          inventoryMovements: [
            buildMovement({
              itemType,
              itemId,
              type: movementType,
              quantity,
              unit: unit || inventory.inventoryUnit,
              reference: reference || "Penyesuaian",
              notes: notes || "Penyesuaian stok simulasi.",
            }),
            ...current.inventoryMovements,
          ],
        },
        itemType,
        itemId,
        signedQuantity
      );

      return nextState;
    });

    pushToast(result.message);
  }

  async function confirmReceiving(payload) {
    const receivedQuantity = Number(payload.receivedQuantity || 0);
    const rejectedQuantity = Number(payload.rejectedQuantity || 0);
    const po = state.purchaseOrders.find((item) => item.id === payload.purchaseOrderId);
    const poItem =
      po?.items.find((item) => item.rawMaterialId === payload.rawMaterialId) || po?.items[0] || null;
    const rawMaterialId = payload.rawMaterialId || poItem?.rawMaterialId;
    const orderedQuantity = Number(poItem?.quantity ?? payload.orderedQuantity ?? 0);
    const priorReceived = state.receivingRecords
      .filter((record) => record.purchaseOrderId === payload.purchaseOrderId && record.rawMaterialId === rawMaterialId)
      .reduce((total, record) => total + Number(record.receivedQuantity || 0), 0);
    const remainingQuantity = Math.max(0, orderedQuantity - priorReceived);

    if (!po || !poItem || !rawMaterialId) {
      pushToast("Purchase Order atau item bahan tidak ditemukan.", "error");
      return;
    }

    if (!isPositiveQuantity(receivedQuantity)) {
      pushToast("Qty diterima harus lebih besar dari nol.", "error");
      return;
    }

    if (rejectedQuantity < 0) {
      pushToast("Qty reject tidak boleh negatif.", "error");
      return;
    }

    if (receivedQuantity > remainingQuantity) {
      pushToast("Qty diterima melebihi sisa quantity Purchase Order.", "error");
      return;
    }

    const result = await confirmReceivingAction({ ...payload, rawMaterialId, orderedQuantity });
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => {
      const currentPriorReceived = current.receivingRecords
        .filter((record) => record.purchaseOrderId === payload.purchaseOrderId && record.rawMaterialId === rawMaterialId)
        .reduce((total, record) => total + Number(record.receivedQuantity || 0), 0);
      const totalReceived = currentPriorReceived + receivedQuantity;
      const poStatus =
        totalReceived >= orderedQuantity && orderedQuantity > 0 ? "Selesai" : "Diterima Sebagian";
      const record = result.record;
      const baseState = {
        ...current,
        purchaseOrders: current.purchaseOrders.map((item) =>
          item.id === payload.purchaseOrderId ? { ...item, status: poStatus } : item
        ),
        receivingRecords: [record, ...current.receivingRecords],
        inventories: updateInventoryCollection(current.inventories, "raw-material", rawMaterialId, receivedQuantity),
        inventoryMovements: [
          buildMovement({
            itemType: "raw-material",
            itemId: rawMaterialId,
            type: "Masuk",
            quantity: receivedQuantity,
            unit: record.unit,
            reference: record.deliveryOrderNumber,
            notes: "Penerimaan bahan dari Purchase Order.",
          }),
          ...current.inventoryMovements,
        ],
      };

      return syncMasterStock(baseState, "raw-material", rawMaterialId, receivedQuantity);
    });

    pushToast(result.message);
  }

  function validateProductionMaterials(productId, targetQuantity) {
    const productBom = state.bom.filter((item) => item.productId === productId);

    return productBom.map((item) => {
      const rawMaterial = state.rawMaterials.find((material) => material.id === item.rawMaterialId);
      const inventory = state.inventories.find(getInventoryMatcher("raw-material", item.rawMaterialId));
      const convertedQuantity = Number(item.quantityPerProduct || 0) * Number(item.conversionFactor || 1);
      const requiredQuantity = Number(targetQuantity || 0) * convertedQuantity;
      const availableStock = Number(inventory?.currentStock || 0);

      return {
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: rawMaterial?.name || "-",
        requiredQuantity,
        availableStock,
        inventoryUnit: item.inventoryUnit,
        sufficient: availableStock >= requiredQuantity,
      };
    });
  }

  async function saveProductionOrder(order) {
    if (!order.productId || !isPositiveQuantity(order.targetQuantity)) {
      pushToast("Order produksi harus memiliki produk dan target quantity lebih besar dari nol.", "error");
      return;
    }

    const result = await saveProductionOrderAction(order);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      productionOrders: upsertCollection(current.productionOrders, result.record),
    }));
    pushToast(result.message);
  }

  async function updateProductionStatus(orderId, status) {
    const order = state.productionOrders.find((item) => item.id === orderId);
    const validation = validateProductionMaterials(order?.productId, order?.targetQuantity);

    if ((status === "Bahan Disiapkan" || status === "Diproses") && validation.some((item) => !item.sufficient)) {
      pushToast("Produksi diblokir karena bahan baku belum mencukupi.", "error");
      return {
        blocked: true,
        validation,
      };
    }

    const result = await updateProductionStatusAction(orderId, status);
    if (!result.ok) {
      pushToast(result.message, "error");
      return {
        blocked: true,
        validation,
      };
    }

    setState((current) => ({
      ...current,
      productionOrders: current.productionOrders.map((item) =>
        item.id === orderId ? { ...item, status } : item
      ),
    }));
    pushToast(result.message);
    return {
      blocked: false,
      validation,
    };
  }

  async function completeProduction(orderId, actualGoodQuantity, failedQuantity) {
    const goodQty = Number(actualGoodQuantity || 0);
    const failedQty = Number(failedQuantity || 0);
    const order = state.productionOrders.find((item) => item.id === orderId);
    const targetQuantity = Number(order?.targetQuantity || 0);

    if (!order) {
      pushToast("Order produksi tidak ditemukan.", "error");
      return;
    }

    if (order.status === "Selesai") {
      pushToast("Order produksi ini sudah selesai.", "error");
      return;
    }

    if (goodQty < 0 || failedQty < 0) {
      pushToast("Qty berhasil dan gagal tidak boleh negatif.", "error");
      return;
    }

    if (goodQty + failedQty > targetQuantity) {
      pushToast("Total qty berhasil dan gagal tidak boleh melebihi target produksi.", "error");
      return;
    }

    const result = await completeProductionAction(orderId, goodQty, failedQty);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => {
      const order = current.productionOrders.find((item) => item.id === orderId);
      if (!order) {
        return current;
      }

      const productBom = current.bom.filter((item) => item.productId === order.productId);
      const missing = productBom
        .map((item) => {
          const inventory = current.inventories.find(getInventoryMatcher("raw-material", item.rawMaterialId));
          const requiredQuantity =
            Number(order.targetQuantity || 0) * Number(item.quantityPerProduct || 0) * Number(item.conversionFactor || 1);
          return {
            ...item,
            requiredQuantity,
            availableStock: Number(inventory?.currentStock || 0),
          };
        })
        .filter((item) => item.availableStock < item.requiredQuantity);

      if (missing.length > 0) {
        pushToast("Produksi tidak dapat diselesaikan karena stok bahan tidak mencukupi.", "error");
        return current;
      }

      let nextState = {
        ...current,
        productionOrders: current.productionOrders.map((item) =>
          item.id === orderId
            ? {
                ...item,
                status: "Selesai",
                actualGoodQuantity: goodQty,
                failedQuantity: failedQty,
              }
            : item
        ),
      };

      productBom.forEach((item) => {
        const rawMaterial = current.rawMaterials.find((material) => material.id === item.rawMaterialId);
        const requiredQuantity =
          Number(order.targetQuantity || 0) * Number(item.quantityPerProduct || 0) * Number(item.conversionFactor || 1);
        nextState = syncMasterStock(
          {
            ...nextState,
            inventories: updateInventoryCollection(
              nextState.inventories,
              "raw-material",
              item.rawMaterialId,
              -requiredQuantity
            ),
            inventoryMovements: [
              buildMovement({
                itemType: "raw-material",
                itemId: item.rawMaterialId,
                type: "Keluar",
                quantity: requiredQuantity,
                unit: item.inventoryUnit,
                reference: order.number,
                notes: `Pemakaian ${rawMaterial?.name || "bahan"} untuk produksi.`,
              }),
              ...nextState.inventoryMovements,
            ],
          },
          "raw-material",
          item.rawMaterialId,
          -requiredQuantity
        );
      });

      nextState = syncMasterStock(
        {
          ...nextState,
          inventories: updateInventoryCollection(nextState.inventories, "finished-product", order.productId, goodQty),
          inventoryMovements: [
            buildMovement({
              itemType: "finished-product",
              itemId: order.productId,
              type: "Masuk",
              quantity: goodQty,
              unit: "pcs",
              reference: order.number,
              notes: "Produk jadi hasil produksi.",
            }),
            ...nextState.inventoryMovements,
          ],
        },
        "finished-product",
        order.productId,
        goodQty
      );

      return nextState;
    });

    pushToast(result.message);
  }

  async function saveDistribution(distribution) {
    if (!distribution.customerId || !distribution.productId || !isPositiveQuantity(distribution.quantity)) {
      pushToast("Distribusi harus memiliki pelanggan, produk, dan quantity lebih besar dari nol.", "error");
      return;
    }

    const result = await saveDistributionAction(distribution);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      distributions: upsertCollection(current.distributions, result.record),
    }));
    pushToast(result.message);
  }

  async function updateDistributionStatus(distributionId, status) {
    const distribution = state.distributions.find((item) => item.id === distributionId);

    if (!distribution) {
      pushToast("Data distribusi tidak ditemukan.", "error");
      return;
    }

    if (status === "Diterima" && distribution.status !== "Dikirim") {
      pushToast("Distribusi harus dikirim terlebih dahulu sebelum ditandai diterima.", "error");
      return;
    }

    if (status === "Dikemas" && ["Dikirim", "Diterima", "Dibatalkan"].includes(distribution.status)) {
      pushToast("Status distribusi ini sudah melewati tahap pengemasan.", "error");
      return;
    }

    const result = await updateDistributionStatusAction(distributionId, status);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => ({
      ...current,
      distributions: current.distributions.map((distribution) =>
        distribution.id === distributionId ? { ...distribution, status } : distribution
      ),
    }));
    pushToast(result.message);
  }

  async function confirmDistributionShipment(distributionId) {
    const distribution = state.distributions.find((item) => item.id === distributionId);

    if (!distribution) {
      pushToast("Data distribusi tidak ditemukan.", "error");
      return;
    }

    if (["Dikirim", "Diterima", "Dibatalkan"].includes(distribution.status)) {
      pushToast("Distribusi ini sudah tidak dapat dikirim ulang.", "error");
      return;
    }

    if (!isPositiveQuantity(distribution.quantity)) {
      pushToast("Quantity distribusi harus lebih besar dari nol.", "error");
      return;
    }

    const inventory = state.inventories.find(getInventoryMatcher("finished-product", distribution.productId));
    const availableStock = Number(inventory?.currentStock || 0);
    const quantity = Number(distribution.quantity || 0);

    if (availableStock < quantity) {
      pushToast("Distribusi diblokir karena stok produk jadi tidak mencukupi.", "error");
      return;
    }

    const result = await confirmDistributionShipmentAction(distributionId);
    if (!result.ok) {
      pushToast(result.message, "error");
      return;
    }

    setState((current) => {
      const baseState = {
        ...current,
        distributions: current.distributions.map((item) =>
          item.id === distributionId ? { ...item, status: "Dikirim" } : item
        ),
        inventories: updateInventoryCollection(current.inventories, "finished-product", distribution.productId, -quantity),
        inventoryMovements: [
          buildMovement({
            itemType: "finished-product",
            itemId: distribution.productId,
            type: "Keluar",
            quantity,
            unit: "pcs",
            reference: distribution.deliveryNoteNumber,
            notes: "Pengeluaran produk jadi untuk distribusi.",
          }),
          ...current.inventoryMovements,
        ],
      };

      return syncMasterStock(baseState, "finished-product", distribution.productId, -quantity);
    });

    pushToast(result.message);
  }

  function markNotificationsRead() {
    markNotificationsReadAction();
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((notification) => ({ ...notification, read: true })),
    }));
  }

  const procurementRows = useMemo(
    () =>
      calculateProcurementPlanRows({
        materialRequirements: state.materialRequirements,
        inventories: state.inventories,
        rawMaterials: state.rawMaterials,
        suppliers: state.suppliers,
        supplierOffers: state.supplierOffers,
      }),
    [state.inventories, state.materialRequirements, state.rawMaterials, state.supplierOffers, state.suppliers]
  );

  const value = {
    ...state,
    hydrated,
    session,
    role,
    setRole,
    toast,
    setToast,
    procurementRows,
    poTotals: Object.fromEntries(state.purchaseOrders.map((po) => [po.id, calculatePoTotal(po.items)])),
    pushToast,
    addNotification,
    saveRecord,
    deleteRecord,
    saveProduct,
    saveRawMaterial,
    saveBomItem,
    saveMonthlySale,
    saveForecast,
    calculateAndSaveMaterialRequirements,
    createProcurementPlans,
    createPurchaseOrderFromPlan,
    updatePurchaseOrderStatus,
    adjustInventory,
    confirmReceiving,
    validateProductionMaterials,
    saveProductionOrder,
    updateProductionStatus,
    completeProduction,
    saveDistribution,
    updateDistributionStatus,
    confirmDistributionShipment,
    markNotificationsRead,
    getSnapshot: () => cloneData(state),
  };

  return <ScmContext.Provider value={value}>{children}</ScmContext.Provider>;
}

export function useScm() {
  const context = useContext(ScmContext);

  if (!context) {
    throw new Error("useScm harus digunakan di dalam ScmProvider.");
  }

  return context;
}
