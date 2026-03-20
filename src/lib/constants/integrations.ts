export const INTEGRATION_PROVIDERS = ["syrve", "poster", "bitrix", "salesbox", "checkbox"] as const;
export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];
export const integrationLabels: Record<string, string> = { syrve: "Syrve", poster: "Poster", bitrix: "Bitrix24", salesbox: "Salesbox", checkbox: "Checkbox" };
export const integrationColors: Record<string, string> = {};
