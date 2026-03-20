export const PLATFORMS = ["syrve", "poster", "joinposter", "checkbox", "bitrix", "salesbox"] as const;
export type Platform = (typeof PLATFORMS)[number];
export function getPlatformLabel(p: string): string { return p; }
export function getPlatformIcon(p: string): string { return p; }

export const platformApi = {
  pushStatus: async (provider: string, externalId: string, status: string) => {},
  getOrders: async (provider: string, params?: any) => ({ data: [] }),
};
