import assert from "node:assert/strict";
import test from "node:test";
import { normalizeProductInput, productStatusLabel, serializeProduct } from "./product-validation.js";

function validProductInput(overrides = {}) {
  return {
    code: "PRD-099",
    name: " Roti Test ",
    category: " Pastry ",
    sellingPrice: "25000",
    unit: " pcs ",
    shelfLifeDays: "3",
    status: "ACTIVE",
    ...overrides,
  };
}

function assertInvalid(overrides, message) {
  const result = normalizeProductInput(validProductInput(overrides));

  assert.equal(result.ok, false);
  assert.equal(result.message, message);
}

function productRecord(overrides = {}) {
  return {
    id: "product-1",
    code: "PRD-001",
    name: "Roti Test",
    category: "Pastry",
    sellingPrice: { toString: () => "18500.5" },
    unit: "pcs",
    shelfLifeDays: 3,
    status: "ACTIVE",
    createdAt: new Date("2026-07-01T01:02:03.000Z"),
    updatedAt: new Date("2026-07-02T04:05:06.000Z"),
    ...overrides,
  };
}

test("normalizeProductInput menerima input valid", () => {
  const result = normalizeProductInput(validProductInput());

  assert.deepEqual(result, {
    ok: true,
    data: {
      code: "PRD-099",
      name: "Roti Test",
      category: "Pastry",
      sellingPrice: 25000,
      unit: "pcs",
      shelfLifeDays: 3,
      status: "ACTIVE",
    },
  });
});

test("normalizeProductInput menormalisasi kode dengan trim dan uppercase", () => {
  const result = normalizeProductInput(validProductInput({ code: " prd-777 " }));

  assert.equal(result.ok, true);
  assert.equal(result.data.code, "PRD-777");
});

test("normalizeProductInput menolak kode kosong", () => {
  assertInvalid({ code: " " }, "Kode produk wajib diisi.");
});

test("normalizeProductInput menolak sellingPrice sama dengan 0", () => {
  assertInvalid({ sellingPrice: 0 }, "Harga jual harus berupa angka lebih dari nol.");
});

test("normalizeProductInput menolak sellingPrice negatif", () => {
  assertInvalid({ sellingPrice: -1 }, "Harga jual harus berupa angka lebih dari nol.");
});

test("normalizeProductInput menolak shelfLifeDays sama dengan 0", () => {
  assertInvalid({ shelfLifeDays: 0 }, "Umur simpan harus berupa bilangan bulat lebih dari nol.");
});

test("normalizeProductInput menolak shelfLifeDays negatif", () => {
  assertInvalid({ shelfLifeDays: -1 }, "Umur simpan harus berupa bilangan bulat lebih dari nol.");
});

test("normalizeProductInput menolak shelfLifeDays desimal", () => {
  assertInvalid({ shelfLifeDays: 1.5 }, "Umur simpan harus berupa bilangan bulat lebih dari nol.");
});

test("normalizeProductInput menolak status selain ACTIVE atau INACTIVE", () => {
  assertInvalid({ status: "ARCHIVED" }, "Status produk tidak valid.");
});

test("serializeProduct mengubah sellingPrice menjadi nilai aman untuk client", () => {
  const result = serializeProduct(productRecord());
  const parsed = JSON.parse(JSON.stringify(result));

  assert.equal(typeof result.sellingPrice, "number");
  assert.equal(Number.isFinite(result.sellingPrice), true);
  assert.equal(parsed.sellingPrice, 18500.5);
});

test("serializeProduct mengubah createdAt dan updatedAt menjadi string ISO", () => {
  const record = productRecord();
  const result = serializeProduct(record);

  assert.equal(result.createdAt, "2026-07-01T01:02:03.000Z");
  assert.equal(result.updatedAt, "2026-07-02T04:05:06.000Z");
});

test("productStatusLabel menerjemahkan enum status", () => {
  assert.equal(productStatusLabel("ACTIVE"), "Aktif");
  assert.equal(productStatusLabel("INACTIVE"), "Tidak Aktif");
});
