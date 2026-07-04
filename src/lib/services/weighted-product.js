export const defaultWeightedProductCriteria = [
  { key: "price", label: "Harga", type: "cost", weight: 0.35 },
  { key: "qualityScore", label: "Kualitas", type: "benefit", weight: 0.25 },
  { key: "capacity", label: "Kapasitas", type: "benefit", weight: 0.2 },
  { key: "distance", label: "Jarak", type: "cost", weight: 0.1 },
  { key: "leadTime", label: "Lead Time", type: "cost", weight: 0.1 },
];

export function validateWeights(criteria = defaultWeightedProductCriteria) {
  const totalWeight = criteria.reduce((total, criterion) => total + Number(criterion.weight || 0), 0);
  return {
    totalWeight,
    isValid: Math.abs(totalWeight - 1) < 0.00001,
  };
}

export function calculateWeightedProduct({
  offers = [],
  suppliers = [],
  requiredQuantity = 0,
  criteria = defaultWeightedProductCriteria,
}) {
  const weightValidation = validateWeights(criteria);

  if (!weightValidation.isValid) {
    return {
      isValid: false,
      error: "Total bobot kriteria harus sama dengan 1.",
      totalWeight: weightValidation.totalWeight,
      rankings: [],
      candidates: [],
    };
  }

  const requestedQuantity = Number(requiredQuantity || 0);
  const candidates = offers.map((offer) => {
    const supplier = suppliers.find((item) => item.id === offer.supplierId);
    const reasons = [];
    const hasPositiveValues = criteria.every((criterion) => Number(offer[criterion.key]) > 0);
    const hasCapacity = Number(offer.capacity || 0) >= requestedQuantity;

    if (!hasPositiveValues) {
      reasons.push("Ada nilai kriteria yang tidak lebih besar dari nol.");
    }

    if (!hasCapacity) {
      reasons.push("Kapasitas supplier lebih kecil dari kebutuhan pembelian.");
    }

    return {
      ...offer,
      supplier,
      supplierName: supplier?.name || "-",
      eligible: hasPositiveValues && hasCapacity,
      eligibilityReason: reasons.length ? reasons.join(" ") : "Memenuhi kapasitas dan seluruh nilai kriteria valid.",
    };
  });

  const eligibleCandidates = candidates.filter((candidate) => candidate.eligible);
  const scored = eligibleCandidates.map((candidate) => {
    const vectorS = criteria.reduce((score, criterion) => {
      const value = Number(candidate[criterion.key]);
      const exponent = criterion.type === "cost" ? -Number(criterion.weight) : Number(criterion.weight);
      return score * value ** exponent;
    }, 1);

    return {
      ...candidate,
      vectorS,
    };
  });

  const totalS = scored.reduce((total, candidate) => total + candidate.vectorS, 0);
  const rankings = scored
    .map((candidate) => ({
      ...candidate,
      vectorV: totalS > 0 ? candidate.vectorS / totalS : 0,
      finalOrderQuantity:
        requestedQuantity <= 0 ? 0 : Math.max(requestedQuantity, Number(candidate.minimumOrder || 0)),
    }))
    .sort((a, b) => b.vectorV - a.vectorV)
    .map((candidate, index) => ({
      ...candidate,
      rank: index + 1,
    }));

  const selected = rankings[0] || null;

  return {
    isValid: true,
    criteria,
    totalWeight: weightValidation.totalWeight,
    requiredQuantity: requestedQuantity,
    candidates: candidates.map((candidate) => {
      const ranked = rankings.find((item) => item.id === candidate.id);
      return ranked || candidate;
    }),
    rankings,
    selected,
    reason: selected
      ? `${selected.supplierName} dipilih karena memiliki nilai V tertinggi (${selected.vectorV.toFixed(
          4
        )}) di antara supplier yang memenuhi kapasitas.`
      : "Tidak ada supplier yang memenuhi kapasitas kebutuhan pembelian.",
  };
}
