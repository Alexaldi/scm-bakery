import assert from "node:assert/strict";
import test from "node:test";
import { createSessionToken, verifySessionToken } from "./jwt.js";
import { hashPassword, verifyPassword } from "./password.js";
import { canAccessPath } from "./permissions.js";

test("hashPassword membuat password bisa diverifikasi tanpa menyimpan teks asli", async () => {
  const hash = await hashPassword("admin12345");

  assert.notEqual(hash, "admin12345");
  assert.equal(await verifyPassword("admin12345", hash), true);
  assert.equal(await verifyPassword("salah", hash), false);
});

test("verifySessionToken menerima token valid dan menolak token rusak", async () => {
  const token = await createSessionToken(
    { userId: "user-1", email: "admin@scm-bakery.local", role: "Administrator", name: "Admin" },
    { secret: "test-secret", now: 1_000, maxAgeSeconds: 60 }
  );

  const session = await verifySessionToken(token, { secret: "test-secret", now: 1_030 });
  const tampered = await verifySessionToken(`${token.slice(0, -1)}x`, { secret: "test-secret", now: 1_030 });
  const expired = await verifySessionToken(token, { secret: "test-secret", now: 1_061 });

  assert.equal(session.role, "Administrator");
  assert.equal(session.email, "admin@scm-bakery.local");
  assert.equal(tampered, null);
  assert.equal(expired, null);
});

test("canAccessPath membatasi route dashboard sesuai role", () => {
  assert.equal(canAccessPath("Administrator", "/dashboard/forecasts"), true);
  assert.equal(canAccessPath("Gudang", "/dashboard/inventory"), true);
  assert.equal(canAccessPath("Gudang", "/dashboard/forecasts"), false);
});
