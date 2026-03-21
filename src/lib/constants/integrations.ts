export const INTEGRATION_PROVIDERS = ["syrve", "poster", "bitrix", "salesbox", "checkbox", "bolt_food", "uber_eats", "menu_ua"] as const;
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
  BOLT_FOOD: "bolt_food",
  GLOVO: "glovo",
  WOLT: "wolt",
  UBER_EATS: "uber_eats",
  MENU_UA: "menu_ua",
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
  bolt_food: "Bolt Food",
  glovo: "Glovo",
  wolt: "Wolt",
  uber_eats: "Uber Eats",
  menu_ua: "Menu.ua",
};
