import { calculateWeightedProduct, defaultWeightedProductCriteria } from "./weighted-product.js";

export function calculateNetRequirement(grossRequirement, currentStock, safetyStock) {
  return Math.max(
    0,
    Number(grossRequirement || 0) - Number(currentStock || 0) + Number(safetyStock || 0)
  );
}

export function calculateFinalPurchaseQuantity(netRequirement, minimumOrder) {
  if (Number(netRequirement || 0) <= 0) {
    return 0;
  }

  return Math.max(Number(netRequirement || 0), Number(minimumOrder || 0));
}

export function calculateProcurementPlanRows({
  materialRequirements = [],
  inventories = [],
  rawMaterials = [],
  suppliers = [],
  supplierOffers = [],
  criteria = defaultWeightedProductCriteria,
}) {
  return materialRequirements.map((requirement) => {
    const rawMaterial = rawMaterials.find((item) => item.id === requirement.rawMaterialId);
    const inventory = inventories.find(
      (item) => item.itemType === "raw-material" && item.rawMaterialId === requirement.rawMaterialId
    );
    const currentStock = Number(inventory?.currentStock ?? rawMaterial?.currentStock ?? 0);
    const safetyStock = Number(inventory?.safetyStock ?? rawMaterial?.safetyStock ?? 0);
    const grossRequirement = Number(requirement.totalGrossRequirement || 0);
    const netRequirement = calculateNetRequirement(grossRequirement, currentStock, safetyStock);
    const offers = supplierOffers.filter((offer) => offer.rawMaterialId === requirement.rawMaterialId);
    const selection = calculateWeightedProduct({
      offers,
      suppliers,
      requiredQuantity: netRequirement,
      criteria,
    });
    const selectedOffer = selection.selected;
    const finalOrderQuantity = calculateFinalPurchaseQuantity(
      netRequirement,
      selectedOffer?.minimumOrder || 0
    );

    return {
      id: requirement.rawMaterialId,
      rawMaterialId: requirement.rawMaterialId,
      rawMaterialName: rawMaterial?.name || requirement.rawMaterialName,
      inventoryUnit: requirement.inventoryUnit || rawMaterial?.inventoryUnit,
      grossRequirement,
      forecastResult: grossRequirement,
      currentStock,
      safetyStock,
      netRequirement,
      selectedSupplierId: selectedOffer?.supplierId || "",
      selectedSupplierName: selectedOffer?.supplierName || "-",
      selectedOfferId: selectedOffer?.id || "",
      minimumOrder: selectedOffer?.minimumOrder || 0,
      finalOrderQuantity,
      unitPrice: selectedOffer?.price || 0,
      leadTime: selectedOffer?.leadTime || 0,
      selection,
      status: finalOrderQuantity > 0 ? "Perlu Dibeli" : "Stok Cukup",
    };
  });
}
