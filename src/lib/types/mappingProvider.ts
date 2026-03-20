export interface MappingProvider { id: string; name: string; type: string; }
export interface MappingEntry { sourceId: string; targetId: string; provider: string; status: string; }
export type MappingStatus = "mapped" | "unmapped" | "conflict" | "ignored";

export type MappingProviderType = "syrve" | "poster" | "salesbox" | "manual";
