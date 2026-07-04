export const indonesianMonths = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function formatNumber(value, options = {}) {
  return new Intl.NumberFormat("id-ID", options).format(Number(value || 0));
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value, options = {}) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatPeriod(period) {
  if (!period) {
    return "-";
  }

  const [year, month] = period.split("-").map(Number);
  const monthName = indonesianMonths[(month || 1) - 1] || period;
  return `${monthName} ${year}`;
}

export function getNextPeriod(period) {
  const [year, month] = period.split("-").map(Number);
  const nextDate = new Date(year, month, 1);
  return `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
}

export function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function stockStatus(currentStock, safetyStock) {
  const current = Number(currentStock || 0);
  const safety = Number(safetyStock || 0);

  if (current <= 0) {
    return "Habis";
  }

  if (current <= safety) {
    return "Menipis";
  }

  return "Aman";
}

export function statusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (
    ["aman", "selesai", "disetujui", "diterima", "aktif", "baik", "dikirim"].some((item) =>
      normalized.includes(item)
    )
  ) {
    return "green";
  }

  if (
    ["menipis", "draft", "direncanakan", "diajukan", "sebagian", "diproses", "dikemas"].some(
      (item) => normalized.includes(item)
    )
  ) {
    return "amber";
  }

  if (
    ["habis", "dibatalkan", "ditolak", "gagal", "tidak aktif", "kurang"].some((item) =>
      normalized.includes(item)
    )
  ) {
    return "red";
  }

  return "blue";
}

export function searchText(item, fields, keyword) {
  const query = String(keyword || "").trim().toLowerCase();

  if (!query) {
    return true;
  }

  return fields.some((field) => String(item[field] || "").toLowerCase().includes(query));
}

export function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}
