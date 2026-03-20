export const JOB_TYPES = ["sync", "import", "export", "cleanup", "mapping"] as const;
export type JobType = (typeof JOB_TYPES)[number];
export const jobLabels: Record<string, string> = { sync: "Sync", import: "Import", export: "Export", cleanup: "Cleanup", mapping: "Mapping" };
export const BACKGROUND_SYNC_JOB_TYPES = {
  SYNC_SALESBOX_CUSTOMERS: "sync_salesbox_customers",
  SYNC_BITRIX_USERS: "sync_bitrix_users",
  BITRIX_AUTO_MATCH: "bitrix_auto_match",
  SYNC_MENU: "sync_menu",
  SYNC_ORDERS: "sync_orders",
} as const;
