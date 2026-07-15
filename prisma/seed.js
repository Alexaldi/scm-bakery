import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum tersedia. Tambahkan DATABASE_URL di .env sebelum menjalankan seed.");
}

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const ACTIVE = "ACTIVE";
const DEFAULT_PASSWORD = "bakery12345";

const users = [
  ["admin@scm-bakery.local", "Administrator SCM", "Administrator"],
  ["ppic@scm-bakery.local", "Staff PPIC", "PPIC"],
  ["purchasing@scm-bakery.local", "Staff Purchasing", "Purchasing"],
  ["gudang@scm-bakery.local", "Staff Gudang", "Gudang"],
  ["produksi@scm-bakery.local", "Staff Produksi", "Produksi"],
  ["distribusi@scm-bakery.local", "Staff Distribusi", "Distribusi"],
];

const products = [
  ["PRD-001", "Butter Croissant", "Pastry", 18500, "pcs", 2, 280],
  ["PRD-002", "Chocolate Danish", "Pastry", 20000, "pcs", 2, 210],
  ["PRD-003", "Cheese Bun Premium", "Roti Manis", 16000, "pcs", 3, 340],
  ["PRD-004", "Cinnamon Roll", "Roti Manis", 17500, "pcs", 3, 190],
  ["PRD-005", "Garlic Cream Bread", "Savory Bread", 15500, "pcs", 2, 260],
];

const rawMaterials = [
  ["BB-001", "Tepung Terigu Premium", "Tepung", "kg", "Rak A1", 132, 150, 120],
  ["BB-002", "Butter", "Dairy", "kg", "Cold Room B1", 95, 70, 50],
  ["BB-003", "Gula Pasir", "Pemanis", "kg", "Rak A3", 78, 80, 55],
  ["BB-004", "Telur Ayam", "Protein", "butir", "Cold Room B2", 760, 600, 450],
  ["BB-005", "Susu Cair", "Dairy", "liter", "Cold Room B1", 92, 85, 65],
  ["BB-006", "Ragi Instan", "Pengembang", "kg", "Rak A2", 18, 20, 12],
  ["BB-007", "Keju Mozzarella", "Dairy", "kg", "Cold Room B3", 64, 45, 35],
  ["BB-008", "Bubuk Kayu Manis", "Rempah", "kg", "Rak C1", 8, 10, 6],
  ["BB-009", "Bawang Putih", "Rempah", "kg", "Rak C2", 22, 18, 12],
  ["BB-010", "Coklat Compound", "Coklat", "kg", "Rak C3", 42, 45, 30],
];

const bom = [
  ["PRD-001", "BB-001", 80, "gram", "kg", 0.001],
  ["PRD-001", "BB-002", 35, "gram", "kg", 0.001],
  ["PRD-001", "BB-003", 8, "gram", "kg", 0.001],
  ["PRD-001", "BB-004", 0.15, "butir", "butir", 1],
  ["PRD-001", "BB-005", 35, "mililiter", "liter", 0.001],
  ["PRD-001", "BB-006", 2, "gram", "kg", 0.001],
  ["PRD-002", "BB-001", 75, "gram", "kg", 0.001],
  ["PRD-002", "BB-002", 28, "gram", "kg", 0.001],
  ["PRD-002", "BB-003", 12, "gram", "kg", 0.001],
  ["PRD-002", "BB-004", 0.12, "butir", "butir", 1],
  ["PRD-002", "BB-005", 30, "mililiter", "liter", 0.001],
  ["PRD-002", "BB-006", 2, "gram", "kg", 0.001],
  ["PRD-002", "BB-010", 25, "gram", "kg", 0.001],
  ["PRD-003", "BB-001", 70, "gram", "kg", 0.001],
  ["PRD-003", "BB-002", 15, "gram", "kg", 0.001],
  ["PRD-003", "BB-003", 8, "gram", "kg", 0.001],
  ["PRD-003", "BB-004", 0.1, "butir", "butir", 1],
  ["PRD-003", "BB-005", 28, "mililiter", "liter", 0.001],
  ["PRD-003", "BB-006", 2, "gram", "kg", 0.001],
  ["PRD-003", "BB-007", 22, "gram", "kg", 0.001],
  ["PRD-004", "BB-001", 85, "gram", "kg", 0.001],
  ["PRD-004", "BB-002", 20, "gram", "kg", 0.001],
  ["PRD-004", "BB-003", 16, "gram", "kg", 0.001],
  ["PRD-004", "BB-004", 0.12, "butir", "butir", 1],
  ["PRD-004", "BB-005", 35, "mililiter", "liter", 0.001],
  ["PRD-004", "BB-006", 2, "gram", "kg", 0.001],
  ["PRD-004", "BB-008", 3, "gram", "kg", 0.001],
  ["PRD-005", "BB-001", 78, "gram", "kg", 0.001],
  ["PRD-005", "BB-002", 18, "gram", "kg", 0.001],
  ["PRD-005", "BB-003", 5, "gram", "kg", 0.001],
  ["PRD-005", "BB-004", 0.1, "butir", "butir", 1],
  ["PRD-005", "BB-005", 25, "mililiter", "liter", 0.001],
  ["PRD-005", "BB-006", 2, "gram", "kg", 0.001],
  ["PRD-005", "BB-009", 4, "gram", "kg", 0.001],
  ["PRD-005", "BB-007", 15, "gram", "kg", 0.001],
];

const supplierNames = [
  "PT Gandum Nusantara",
  "CV Sari Tepung Jaya",
  "UD Pangan Prima",
  "PT Dairy Fresh Indonesia",
  "CV Butter Makmur",
  "Koperasi Susu Lembang",
  "PT Gula Sentosa",
  "CV Manis Sejahtera",
  "UD Sumber Rasa",
  "Peternakan Telur Barokah",
  "CV Unggas Mandiri",
  "PT Protein Pagi",
  "PT Susu Murni Jabar",
  "CV Dairy Lokal",
  "UD Segar Harian",
  "PT Fermenta Bakery",
  "CV Ragi Kencana",
  "UD Bahan Roti Cepat",
  "PT Keju Prima",
  "CV Mozza Lestari",
  "UD Dairy Artisan",
  "PT Rempah Aromatik",
  "CV Kayu Manis Timur",
  "UD Rempah Wangi",
  "PT Bumbu Dapur Jaya",
  "CV Garlic Fresh",
  "UD Bawang Nusantara",
  "PT Coklat Rasa",
  "CV Cocoa Sentosa",
  "UD Coklat Mandiri",
];

const contactNames = ["Budi Santoso", "Siti Rahma", "Agus Pratama", "Dewi Lestari", "Rina Maharani"];
const distances = [8, 12, 18, 24, 32, 15, 27, 36, 42, 55];

const supplierOffers = [
  ["SUP-001", "BB-001", "kg", 13000, 5, 540, 50, 2],
  ["SUP-002", "BB-001", "kg", 12600, 4, 430, 40, 3],
  ["SUP-003", "BB-001", "kg", 12100, 4, 360, 35, 4],
  ["SUP-004", "BB-002", "kg", 92000, 5, 250, 20, 4],
  ["SUP-005", "BB-002", "kg", 89000, 4, 220, 18, 5],
  ["SUP-006", "BB-002", "kg", 94000, 5, 180, 15, 3],
  ["SUP-007", "BB-003", "kg", 15600, 4, 360, 30, 3],
  ["SUP-008", "BB-003", "kg", 14900, 4, 320, 25, 4],
  ["SUP-009", "BB-003", "kg", 15100, 4, 280, 20, 5],
  ["SUP-010", "BB-004", "butir", 2200, 5, 2300, 300, 2],
  ["SUP-011", "BB-004", "butir", 2150, 4, 1900, 250, 2],
  ["SUP-012", "BB-004", "butir", 2300, 5, 1600, 200, 1],
  ["SUP-013", "BB-005", "liter", 18500, 5, 320, 25, 2],
  ["SUP-014", "BB-005", "liter", 17900, 4, 280, 20, 3],
  ["SUP-015", "BB-005", "liter", 18800, 5, 220, 18, 2],
  ["SUP-016", "BB-006", "kg", 69000, 5, 80, 5, 3],
  ["SUP-017", "BB-006", "kg", 66000, 4, 70, 5, 4],
  ["SUP-018", "BB-006", "kg", 71000, 5, 60, 4, 2],
  ["SUP-019", "BB-007", "kg", 76000, 5, 180, 15, 4],
  ["SUP-020", "BB-007", "kg", 73000, 4, 150, 12, 5],
  ["SUP-021", "BB-007", "kg", 79000, 5, 120, 10, 3],
  ["SUP-022", "BB-008", "kg", 118000, 4, 45, 3, 5],
  ["SUP-023", "BB-008", "kg", 113000, 4, 38, 2, 6],
  ["SUP-024", "BB-008", "kg", 121000, 5, 32, 2, 4],
  ["SUP-025", "BB-009", "kg", 34000, 4, 100, 8, 2],
  ["SUP-026", "BB-009", "kg", 32000, 4, 86, 6, 3],
  ["SUP-027", "BB-009", "kg", 36000, 5, 74, 5, 2],
  ["SUP-028", "BB-010", "kg", 61000, 5, 160, 12, 4],
  ["SUP-029", "BB-010", "kg", 58500, 4, 145, 10, 5],
  ["SUP-030", "BB-010", "kg", 63000, 5, 120, 8, 3],
];

const customers = [
  ["CUST-001", "Daily Mart Dago", "Retail", "Maya", "0812345001", "Jl. Dago No. 88, Bandung", "Bandung Utara"],
  ["CUST-002", "Kafe Sudut Kota", "HoReCa", "Rizki", "0812345002", "Jl. Braga No. 21, Bandung", "Bandung Tengah"],
  ["CUST-003", "Morning Bite Distributor", "Distributor", "Nadia", "0812345003", "Jl. Amir Machmud No. 41, Cimahi", "Cimahi"],
  ["CUST-004", "Hotel Lembah Sari", "HoReCa", "Teguh", "0812345004", "Jl. Raya Lembang No. 15, Lembang", "Lembang"],
  ["CUST-005", "Fresh Corner Setiabudi", "Retail", "Anisa", "0812345005", "Jl. Setiabudi No. 109, Bandung", "Bandung Utara"],
  ["CUST-006", "Roti Pagi Agency", "Distributor", "Dimas", "0812345006", "Jl. Soekarno Hatta No. 250, Bandung", "Bandung Timur"],
];

const periods = [
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03",
  "2026-04",
  "2026-05",
  "2026-06",
];

const salesSeries = {
  "PRD-001": [1180, 1215, 1206, 1264, 1298, 1355, 1332, 1386, 1410, 1458, 1436, 1504],
  "PRD-002": [910, 945, 938, 972, 1010, 1044, 1028, 1065, 1098, 1125, 1110, 1168],
  "PRD-003": [760, 794, 812, 805, 850, 878, 902, 895, 936, 952, 980, 1008],
  "PRD-004": [640, 655, 682, 674, 718, 742, 730, 768, 791, 784, 828, 856],
  "PRD-005": [830, 858, 846, 889, 912, 948, 935, 975, 1002, 992, 1036, 1075],
};

function monthStart(period) {
  return new Date(`${period}-01T00:00:00.000Z`);
}

function byCode(records) {
  return Object.fromEntries(records.map((record) => [record.code, record.id]));
}

async function seedUsers() {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  for (const [email, name, role] of users) {
    await prisma.user.upsert({
      where: { email },
      update: { name, role, status: ACTIVE },
      create: { email, name, role, passwordHash, status: ACTIVE },
    });
  }
}

async function seedProducts() {
  const records = [];

  for (const [code, name, category, sellingPrice, unit, shelfLifeDays] of products) {
    records.push(
      await prisma.product.upsert({
        where: { code },
        update: { name, category, sellingPrice, unit, shelfLifeDays, status: ACTIVE },
        create: { code, name, category, sellingPrice, unit, shelfLifeDays, status: ACTIVE },
      })
    );
  }

  return byCode(records);
}

async function seedRawMaterials() {
  const records = [];

  for (const [code, name, category, inventoryUnit, warehouseLocation] of rawMaterials) {
    records.push(
      await prisma.rawMaterial.upsert({
        where: { code },
        update: { name, category, inventoryUnit, warehouseLocation, status: ACTIVE },
        create: { code, name, category, inventoryUnit, warehouseLocation, status: ACTIVE },
      })
    );
  }

  return byCode(records);
}

async function seedBom(productIds, rawMaterialIds) {
  for (const [productCode, rawMaterialCode, quantityPerProduct, usageUnit, inventoryUnit, conversionFactor] of bom) {
    const productId = productIds[productCode];
    const rawMaterialId = rawMaterialIds[rawMaterialCode];

    await prisma.billOfMaterial.upsert({
      where: { productId_rawMaterialId: { productId, rawMaterialId } },
      update: { quantityPerProduct, usageUnit, inventoryUnit, conversionFactor },
      create: { productId, rawMaterialId, quantityPerProduct, usageUnit, inventoryUnit, conversionFactor },
    });
  }
}

async function seedSuppliers() {
  const records = [];

  for (const [index, name] of supplierNames.entries()) {
    const code = `SUP-${String(index + 1).padStart(3, "0")}`;
    records.push(
      await prisma.supplier.upsert({
        where: { code },
        update: {
          name,
          contactPerson: contactNames[index % contactNames.length],
          phone: `08${String(1200000000 + index * 7321).slice(0, 10)}`,
          email: `supplier${index + 1}@contoh.id`,
          address: `Jl. Industri Bakery No. ${index + 11}, Bandung`,
          distanceKm: distances[index % distances.length],
          status: ACTIVE,
        },
        create: {
          code,
          name,
          contactPerson: contactNames[index % contactNames.length],
          phone: `08${String(1200000000 + index * 7321).slice(0, 10)}`,
          email: `supplier${index + 1}@contoh.id`,
          address: `Jl. Industri Bakery No. ${index + 11}, Bandung`,
          distanceKm: distances[index % distances.length],
          status: ACTIVE,
        },
      })
    );
  }

  return byCode(records);
}

async function seedSupplierMaterials(supplierIds, rawMaterialIds) {
  for (const [supplierCode, rawMaterialCode, unit, price, qualityScore, capacity, minimumOrder, leadTimeDays] of supplierOffers) {
    const supplierId = supplierIds[supplierCode];
    const rawMaterialId = rawMaterialIds[rawMaterialCode];

    await prisma.supplierMaterial.upsert({
      where: { supplierId_rawMaterialId: { supplierId, rawMaterialId } },
      update: { price, qualityScore, capacity, minimumOrder, leadTimeDays, unit, status: ACTIVE },
      create: { supplierId, rawMaterialId, price, qualityScore, capacity, minimumOrder, leadTimeDays, unit, status: ACTIVE },
    });
  }
}

async function seedCustomers() {
  for (const [code, name, customerType, contactPerson, phone, address, region] of customers) {
    await prisma.customer.upsert({
      where: { code },
      update: { name, customerType, contactPerson, phone, address, region, status: ACTIVE },
      create: { code, name, customerType, contactPerson, phone, address, region, status: ACTIVE },
    });
  }
}

async function seedSales(productIds) {
  for (const [productCode, quantities] of Object.entries(salesSeries)) {
    const productId = productIds[productCode];

    for (const [index, quantitySold] of quantities.entries()) {
      const period = monthStart(periods[index]);

      await prisma.sale.upsert({
        where: { productId_period: { productId, period } },
        update: { quantitySold },
        create: { productId, period, quantitySold },
      });
    }
  }
}

async function seedInventories(productIds, rawMaterialIds) {
  for (const [code, , , , , currentStock, safetyStock, minimumStock] of rawMaterials) {
    const rawMaterialId = rawMaterialIds[code];

    await prisma.rawMaterialInventory.upsert({
      where: { rawMaterialId },
      update: { currentStock, safetyStock, minimumStock, incomingQuantity: 0, outgoingQuantity: 0 },
      create: { rawMaterialId, currentStock, safetyStock, minimumStock, incomingQuantity: 0, outgoingQuantity: 0 },
    });
  }

  for (const [code, , , , , , finishedStock] of products) {
    const productId = productIds[code];

    await prisma.finishedProductInventory.upsert({
      where: { productId },
      update: { currentStock: finishedStock, reservedStock: 0 },
      create: { productId, currentStock: finishedStock, reservedStock: 0 },
    });
  }
}

async function countRecords() {
  return {
    User: await prisma.user.count(),
    Product: await prisma.product.count(),
    RawMaterial: await prisma.rawMaterial.count(),
    BillOfMaterial: await prisma.billOfMaterial.count(),
    Supplier: await prisma.supplier.count(),
    SupplierMaterial: await prisma.supplierMaterial.count(),
    Customer: await prisma.customer.count(),
    Sale: await prisma.sale.count(),
    RawMaterialInventory: await prisma.rawMaterialInventory.count(),
    FinishedProductInventory: await prisma.finishedProductInventory.count(),
  };
}

async function main() {
  // ponytail: range/non-negative checks stay as seed data discipline until CRUD writes move server-side.
  await seedUsers();
  const productIds = await seedProducts();
  const rawMaterialIds = await seedRawMaterials();
  await seedBom(productIds, rawMaterialIds);
  const supplierIds = await seedSuppliers();
  await seedSupplierMaterials(supplierIds, rawMaterialIds);
  await seedCustomers();
  await seedSales(productIds);
  await seedInventories(productIds, rawMaterialIds);

  console.table(await countRecords());
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
