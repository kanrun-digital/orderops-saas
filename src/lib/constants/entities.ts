export const ENTITY_TYPES = {
  CUSTOMER: "customer",
  ORDER: "order",
  PRODUCT: "product",
  CATEGORY: "category",
  ADDRESS: "address",
  MODIFIER_GROUP: "modifier_group",
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export const entityLabels: Record<EntityType, string> = {
  customer: "Customer",
  order: "Order",
  product: "Product",
  category: "Category",
  address: "Address",
  modifier_group: "Modifier group",
};
