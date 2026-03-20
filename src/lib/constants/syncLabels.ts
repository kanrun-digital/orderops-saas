export const syncLabels: Record<string, string> = {
  menu: "Menu Sync",
  customers: "Customers Sync",
  orders: "Orders Sync",
  categories: "Categories Sync",
  products: "Products Sync",
};
export function getSyncLabel(key: string): string { return syncLabels[key] || key; }

export const PROVIDER_LABELS: Record<string, string> = {
  syrve: "Syrve",
  poster: "Poster",
  bitrix: "Bitrix24",
  salesbox: "Salesbox",
  checkbox: "Checkbox",
  bolt: "Bolt",
  glovo: "Glovo",
  wolt: "Wolt",
};
