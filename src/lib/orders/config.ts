export const orderConfig = {
  statuses: ["new", "confirmed", "preparing", "delivering", "completed", "cancelled"] as const,
  defaultPageSize: 20,
  maxExportSize: 5000,
};
export type OrderStatus = (typeof orderConfig.statuses)[number];

export const statusMeta: Record<string, { label: string; color: string; icon?: string }> = {
  new: { label: "New", color: "blue" },
  confirmed: { label: "Confirmed", color: "indigo" },
  preparing: { label: "Preparing", color: "yellow" },
  delivering: { label: "Delivering", color: "orange" },
  completed: { label: "Completed", color: "green" },
  cancelled: { label: "Cancelled", color: "red" },
};

export function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    syrve: "Syrve", salesbox: "SalesBox", bolt: "Bolt", glovo: "Glovo",
    wolt: "Wolt", manual: "Manual", website: "Website", qr: "QR Menu",
  };
  return labels[source] || source;
}
export function getSourceBadgeVariant(source: string): string {
  const variants: Record<string, string> = {
    syrve: "default", salesbox: "secondary", bolt: "outline",
    glovo: "outline", wolt: "outline", manual: "secondary",
  };
  return variants[source] || "default";
}
export const statusOptions = orderConfig.statuses.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
