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
