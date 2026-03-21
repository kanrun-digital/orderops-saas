export const INTEGRATION_PROVIDERS = ["syrve", "poster", "bitrix", "salesbox", "checkbox"] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];
export const integrationLabels: Record<string, string> = { syrve: "Syrve", poster: "Poster", bitrix: "Bitrix24", salesbox: "Salesbox", checkbox: "Checkbox" };
export const integrationColors: Record<string, string> = {};

export const PROVIDER_CODES = {
  SYRVE: "syrve",
  POSTER: "poster",
  BITRIX: "bitrix",
  BITRIX_SITE: "bitrix",
  SALESBOX: "salesbox",
  CHECKBOX: "checkbox",
  BOLT: "bolt",
  GLOVO: "glovo",
  WOLT: "wolt",
} as const;

export type MenuCapableProvider = "syrve" | "poster";
export const MENU_CAPABLE_PROVIDERS: MenuCapableProvider[] = ["syrve", "poster"];

export const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  syrve: "Syrve",
  poster: "Poster",
  bitrix: "Bitrix24",
  salesbox: "Salesbox",
  checkbox: "Checkbox",
  bolt: "Bolt",
  glovo: "Glovo",
  wolt: "Wolt",
};
