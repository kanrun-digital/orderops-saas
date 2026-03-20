export const APP_NAME = "OrderOps";
export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en", "ru", "uk"] as const;
export const PAGE_SIZE = 20;
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

export const PAGINATION: any = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};


export const TIMING: any = {
  UI_FEEDBACK_MS: 1500,
  DEBOUNCE_MS: 300,
  DEBOUNCE_DEFAULT_MS: 300,
  DEBOUNCE_SEARCH_MS: 300,
  POLLING_INTERVAL_MS: 30000,
};
