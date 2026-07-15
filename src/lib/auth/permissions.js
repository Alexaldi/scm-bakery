export const roleRoutes = [
  ["/dashboard/master/products", ["Administrator", "PPIC", "Produksi"]],
  ["/dashboard/master/raw-materials", ["Administrator", "PPIC", "Gudang", "Purchasing"]],
  ["/dashboard/master/bom", ["Administrator", "PPIC", "Produksi"]],
  ["/dashboard/master/suppliers", ["Administrator", "Purchasing"]],
  ["/dashboard/master/customers", ["Administrator", "Distribusi"]],
  ["/dashboard/sales", ["Administrator", "PPIC"]],
  ["/dashboard/forecasts", ["Administrator", "PPIC"]],
  ["/dashboard/material-requirements", ["Administrator", "PPIC", "Produksi"]],
  ["/dashboard/inventory", ["Administrator", "Gudang", "PPIC"]],
  ["/dashboard/supplier-selection", ["Administrator", "Purchasing"]],
  ["/dashboard/procurement", ["Administrator", "Purchasing", "PPIC"]],
  ["/dashboard/purchase-orders", ["Administrator", "Purchasing"]],
  ["/dashboard/receiving", ["Administrator", "Gudang", "Purchasing"]],
  ["/dashboard/production", ["Administrator", "Produksi", "PPIC"]],
  ["/dashboard/distribution", ["Administrator", "Distribusi"]],
  ["/dashboard/reports", ["Administrator", "PPIC", "Purchasing", "Gudang", "Produksi", "Distribusi"]],
];

export function canAccessRole(role, allowedRoles = []) {
  return role === "Administrator" || !allowedRoles.length || allowedRoles.includes(role);
}

export function canAccessPath(role, pathname) {
  if (role === "Administrator" || pathname === "/dashboard") {
    return true;
  }

  const route = roleRoutes
    .filter(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return route ? canAccessRole(role, route[1]) : true;
}
