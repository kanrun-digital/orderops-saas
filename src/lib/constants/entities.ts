export const ENTITY_TYPES = ["customer", "order", "product", "category", "address"] as const;
export type EntityType = (typeof ENTITY_TYPES)[number];
export const entityLabels: Record<string, string> = { customer: "Customer", order: "Order", product: "Product", category: "Category", address: "Address" };
