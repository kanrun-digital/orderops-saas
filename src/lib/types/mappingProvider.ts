export interface MappingProvider {
  code: string;
  enum: MappingProviderType | string;
  displayName: string;
  connectionId?: string;
  exportFunction?: string;
  exportAction?: string;
  supportsExternalCategories?: boolean;
  categoryCreateAction?: string;
  categoryDeleteAction?: string;
  mappingCreateAction?: string;
  mappingDeleteAction?: string;
}

export interface MappingEntry {
  sourceId: string;
  targetId: string;
  provider: string;
  status: string;
}

export type MappingStatus = "mapped" | "unmapped" | "conflict" | "ignored";

export type MappingProviderType =
  | "syrve"
  | "poster"
  | "salesbox"
  | "manual"
  | "bitrix"
  | "checkbox"
  | "bolt"
  | "bolt_food"
  | "glovo"
  | "wolt"
  | "uber_eats"
  | "menu_ua";
