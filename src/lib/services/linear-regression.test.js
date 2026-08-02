import assert from "node:assert/strict";
import test from "node:test";
import { calculateBestLinearRegression } from "./linear-regression.js";

test("calculateBestLinearRegression memilih range dengan error backtest terkecil", () => {
  const result = calculateBestLinearRegression([100, 100, 100, 100, 100, 100, 300, 310, 320, 330], [3, 6]);

  assert.equal(result.isValid, true);
  assert.equal(result.selectedRange, 3);
  assert.equal(result.backtestError, 0);
  assert.equal(result.predictedY, 340);
});

test("calculateBestLinearRegression tetap memakai data tersedia saat range lebih besar dari data", () => {
  const result = calculateBestLinearRegression([120, 130, 140], [3, 6, 9]);

  assert.equal(result.isValid, true);
  assert.equal(result.selectedRange, 3);
  assert.equal(result.predictedY, 150);
});
