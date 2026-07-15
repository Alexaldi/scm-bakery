-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "historicalPeriods" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "predictedQuantity" INTEGER NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "calculation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialRequirement" (
    "id" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "forecastId" TEXT,
    "totalGrossRequirement" DECIMAL(12,4) NOT NULL,
    "inventoryUnit" TEXT NOT NULL,
    "products" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "movementDate" TIMESTAMP(3) NOT NULL,
    "itemType" TEXT NOT NULL,
    "rawMaterialId" TEXT,
    "productId" TEXT,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcurementPlan" (
    "id" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "materialRequirementId" TEXT,
    "selectedSupplierId" TEXT,
    "selectedOfferId" TEXT,
    "grossRequirement" DECIMAL(12,4) NOT NULL,
    "currentStock" DECIMAL(12,4) NOT NULL,
    "safetyStock" DECIMAL(12,4) NOT NULL,
    "netRequirement" DECIMAL(12,4) NOT NULL,
    "minimumOrder" DECIMAL(12,4) NOT NULL,
    "finalOrderQuantity" DECIMAL(12,4) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "inventoryUnit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcurementPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "supplierId" TEXT,
    "procurementPlanId" TEXT,
    "orderDate" TIMESTAMP(3) NOT NULL,
    "expectedArrivalDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "quantity" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceivingRecord" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "deliveryOrderNumber" TEXT NOT NULL,
    "receivedDate" TIMESTAMP(3) NOT NULL,
    "rawMaterialId" TEXT NOT NULL,
    "orderedQuantity" DECIMAL(12,4) NOT NULL,
    "receivedQuantity" DECIMAL(12,4) NOT NULL,
    "rejectedQuantity" DECIMAL(12,4) NOT NULL,
    "unit" TEXT NOT NULL,
    "qualityResult" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceivingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductionOrder" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "forecastId" TEXT,
    "targetQuantity" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "actualGoodQuantity" INTEGER NOT NULL DEFAULT 0,
    "failedQuantity" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distribution" (
    "id" TEXT NOT NULL,
    "deliveryNoteNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "shipmentDate" TIMESTAMP(3) NOT NULL,
    "vehicle" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recipientName" TEXT NOT NULL,
    "recipientPhone" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Forecast_productId_idx" ON "Forecast"("productId");

-- CreateIndex
CREATE INDEX "Forecast_period_idx" ON "Forecast"("period");

-- CreateIndex
CREATE UNIQUE INDEX "Forecast_productId_period_key" ON "Forecast"("productId", "period");

-- CreateIndex
CREATE INDEX "MaterialRequirement_rawMaterialId_idx" ON "MaterialRequirement"("rawMaterialId");

-- CreateIndex
CREATE INDEX "MaterialRequirement_period_idx" ON "MaterialRequirement"("period");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialRequirement_period_rawMaterialId_key" ON "MaterialRequirement"("period", "rawMaterialId");

-- CreateIndex
CREATE INDEX "InventoryMovement_movementDate_idx" ON "InventoryMovement"("movementDate");

-- CreateIndex
CREATE INDEX "InventoryMovement_rawMaterialId_idx" ON "InventoryMovement"("rawMaterialId");

-- CreateIndex
CREATE INDEX "InventoryMovement_productId_idx" ON "InventoryMovement"("productId");

-- CreateIndex
CREATE INDEX "ProcurementPlan_period_idx" ON "ProcurementPlan"("period");

-- CreateIndex
CREATE INDEX "ProcurementPlan_rawMaterialId_idx" ON "ProcurementPlan"("rawMaterialId");

-- CreateIndex
CREATE INDEX "ProcurementPlan_selectedSupplierId_idx" ON "ProcurementPlan"("selectedSupplierId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_number_key" ON "PurchaseOrder"("number");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_procurementPlanId_key" ON "PurchaseOrder"("procurementPlanId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderDate_idx" ON "PurchaseOrder"("orderDate");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseOrderId_idx" ON "PurchaseOrderItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_rawMaterialId_idx" ON "PurchaseOrderItem"("rawMaterialId");

-- CreateIndex
CREATE INDEX "ReceivingRecord_purchaseOrderId_idx" ON "ReceivingRecord"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "ReceivingRecord_rawMaterialId_idx" ON "ReceivingRecord"("rawMaterialId");

-- CreateIndex
CREATE INDEX "ReceivingRecord_receivedDate_idx" ON "ReceivingRecord"("receivedDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionOrder_number_key" ON "ProductionOrder"("number");

-- CreateIndex
CREATE INDEX "ProductionOrder_productId_idx" ON "ProductionOrder"("productId");

-- CreateIndex
CREATE INDEX "ProductionOrder_forecastId_idx" ON "ProductionOrder"("forecastId");

-- CreateIndex
CREATE INDEX "ProductionOrder_scheduledDate_idx" ON "ProductionOrder"("scheduledDate");

-- CreateIndex
CREATE INDEX "ProductionOrder_status_idx" ON "ProductionOrder"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Distribution_deliveryNoteNumber_key" ON "Distribution"("deliveryNoteNumber");

-- CreateIndex
CREATE INDEX "Distribution_customerId_idx" ON "Distribution"("customerId");

-- CreateIndex
CREATE INDEX "Distribution_productId_idx" ON "Distribution"("productId");

-- CreateIndex
CREATE INDEX "Distribution_shipmentDate_idx" ON "Distribution"("shipmentDate");

-- CreateIndex
CREATE INDEX "Distribution_status_idx" ON "Distribution"("status");

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequirement" ADD CONSTRAINT "MaterialRequirement_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialRequirement" ADD CONSTRAINT "MaterialRequirement_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPlan" ADD CONSTRAINT "ProcurementPlan_materialRequirementId_fkey" FOREIGN KEY ("materialRequirementId") REFERENCES "MaterialRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPlan" ADD CONSTRAINT "ProcurementPlan_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPlan" ADD CONSTRAINT "ProcurementPlan_selectedSupplierId_fkey" FOREIGN KEY ("selectedSupplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcurementPlan" ADD CONSTRAINT "ProcurementPlan_selectedOfferId_fkey" FOREIGN KEY ("selectedOfferId") REFERENCES "SupplierMaterial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_procurementPlanId_fkey" FOREIGN KEY ("procurementPlanId") REFERENCES "ProcurementPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivingRecord" ADD CONSTRAINT "ReceivingRecord_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceivingRecord" ADD CONSTRAINT "ReceivingRecord_rawMaterialId_fkey" FOREIGN KEY ("rawMaterialId") REFERENCES "RawMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_forecastId_fkey" FOREIGN KEY ("forecastId") REFERENCES "Forecast"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribution" ADD CONSTRAINT "Distribution_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
