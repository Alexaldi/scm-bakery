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
