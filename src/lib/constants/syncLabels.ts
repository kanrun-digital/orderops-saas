export const syncLabels: Record<string, string> = {
  menu: "Menu Sync",
  customers: "Customers Sync",
  orders: "Orders Sync",
  categories: "Categories Sync",
  products: "Products Sync",
};
export function getSyncLabel(key: string): string { return syncLabels[key] || key; }
