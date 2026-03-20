export const DELIVERY_TYPES = ["delivery", "pickup", "dine_in"] as const;
export type DeliveryType = (typeof DELIVERY_TYPES)[number];
export function getDeliveryTypeLabel(type: string): string { return type; }
export function getDeliveryTypeIcon(type: string): string { return "🚗"; }

export function normalizeOrderDeliveryType(params: { deliveryType?: string; source?: string }): string {
  return params.deliveryType || "delivery";
}
