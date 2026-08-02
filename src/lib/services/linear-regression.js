export function calculateLinearRegression(salesValues) {
  const values = (salesValues || []).map(Number).filter((value) => Number.isFinite(value));
  const n = values.length;

  if (n < 3) {
    return {
      isValid: false,
      error: "Minimal diperlukan tiga periode penjualan untuk regresi linier.",
    };
  }

  const rows = values.map((y, index) => {
    const x = index + 1;

    return {
      x,
      y,
      xy: x * y,
      xSquare: x * x,
    };
  });

  const sumX = rows.reduce((total, row) => total + row.x, 0);
  const sumY = rows.reduce((total, row) => total + row.y, 0);
  const sumXY = rows.reduce((total, row) => total + row.xy, 0);
  const sumXSquare = rows.reduce((total, row) => total + row.xSquare, 0);
  const denominator = n * sumXSquare - sumX * sumX;

  if (denominator === 0) {
    return {
      isValid: false,
      error: "Perhitungan regresi tidak dapat dilakukan karena pembagi bernilai nol.",
      n,
      rows,
      sumX,
      sumY,
      sumXY,
      sumXSquare,
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const nextX = n + 1;
  const rawPrediction = intercept + slope * nextX;
  const predictedY = Math.ceil(Math.max(0, rawPrediction));

  return {
    isValid: true,
    n,
    rows,
    sumX,
    sumY,
    sumXY,
    sumXSquare,
    slope,
    intercept,
    nextX,
    rawPrediction,
    predictedY,
    equation: `Y = ${intercept.toFixed(2)} + ${slope.toFixed(2)}X`,
  };
}

export function calculateBestLinearRegression(salesValues, ranges = [3, 6, 9, 12]) {
  const values = (salesValues || []).map(Number).filter((value) => Number.isFinite(value));

  if (values.length < 3) {
    return calculateLinearRegression(values);
  }

  const candidates = ranges
    .filter((range) => Number(range) >= 3)
    .map((range) => Math.min(Number(range), values.length))
    .filter((range, index, list) => list.indexOf(range) === index)
    .map((range) => {
      const finalCalculation = calculateLinearRegression(values.slice(-range));
      const canBacktest = values.length > range;
      const backtestCalculation = canBacktest
        ? calculateLinearRegression(values.slice(values.length - range - 1, values.length - 1))
        : null;
      const actual = values.at(-1);
      const backtestError = backtestCalculation?.isValid
        ? Math.abs(Number(backtestCalculation.predictedY || 0) - actual)
        : null;

      return {
        range,
        isValid: finalCalculation.isValid,
        backtestError,
        calculation: finalCalculation,
      };
    })
    .filter((candidate) => candidate.isValid);

  const scored = candidates.filter((candidate) => candidate.backtestError !== null);
  const selected = (scored.length ? scored : candidates).sort(
    (left, right) =>
      (left.backtestError ?? Number.POSITIVE_INFINITY) - (right.backtestError ?? Number.POSITIVE_INFINITY) ||
      right.range - left.range
  )[0];

  if (!selected) {
    return calculateLinearRegression(values);
  }

  return {
    ...selected.calculation,
    selectedRange: selected.range,
    backtestError: selected.backtestError,
    candidates,
  };
}
