export const orderConfig = {
  statuses: ["new", "confirmed", "preparing", "delivering", "completed", "cancelled"] as const,
  defaultPageSize: 20,
  maxExportSize: 5000,
};
export type OrderStatus = (typeof orderConfig.statuses)[number];
