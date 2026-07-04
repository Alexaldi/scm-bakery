export function calculateMaterialRequirements({
  forecasts = [],
  bom = [],
  products = [],
  rawMaterials = [],
}) {
  const approvedForecasts = forecasts.filter((forecast) => forecast.status === "Disetujui");
  const requirementsByMaterial = new Map();
  const detailedRows = [];

  approvedForecasts.forEach((forecast) => {
    const product = products.find((item) => item.id === forecast.productId);
    const productBom = bom.filter((item) => item.productId === forecast.productId);

    productBom.forEach((bomItem) => {
      const rawMaterial = rawMaterials.find((item) => item.id === bomItem.rawMaterialId);
      const convertedQuantity =
        Number(bomItem.quantityPerProduct || 0) * Number(bomItem.conversionFactor || 1);
      const forecastQuantity = Number(forecast.quantity ?? forecast.predictedQuantity ?? 0);
      const grossRequirement = forecastQuantity * convertedQuantity;

      const detail = {
        id: `${forecast.id}-${bomItem.rawMaterialId}`,
        forecastId: forecast.id,
        period: forecast.period,
        productId: forecast.productId,
        productName: product?.name || "-",
        forecastQuantity,
        rawMaterialId: bomItem.rawMaterialId,
        rawMaterialName: rawMaterial?.name || "-",
        quantityPerProduct: Number(bomItem.quantityPerProduct || 0),
        usageUnit: bomItem.usageUnit,
        inventoryUnit: bomItem.inventoryUnit,
        conversionFactor: Number(bomItem.conversionFactor || 1),
        convertedQuantity,
        grossRequirement,
      };

      detailedRows.push(detail);

      const existing = requirementsByMaterial.get(bomItem.rawMaterialId) || {
        rawMaterialId: bomItem.rawMaterialId,
        rawMaterialName: rawMaterial?.name || "-",
        inventoryUnit: bomItem.inventoryUnit,
        totalGrossRequirement: 0,
        products: [],
      };

      existing.totalGrossRequirement += grossRequirement;
      existing.products.push(detail);
      requirementsByMaterial.set(bomItem.rawMaterialId, existing);
    });
  });

  const aggregated = Array.from(requirementsByMaterial.values()).map((item) => ({
    ...item,
    totalGrossRequirement: Math.ceil(item.totalGrossRequirement * 100) / 100,
  }));

  return {
    detailedRows,
    aggregated,
    totalMaterials: aggregated.length,
    totalGrossRequirement: aggregated.reduce((total, item) => total + item.totalGrossRequirement, 0),
  };
}
