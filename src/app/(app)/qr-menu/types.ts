export interface Site {
  id: string;
  pk_id?: number;
  name: string;
  slug: string;
  account_id: string;
  status: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface TableItem {
  id: string;
  pk_id?: number;
  site_id: string;
  code: string;
  label?: string;
  status: string;
  [key: string]: any;
}

export interface SiteFormState {
  name: string;
  slug: string;
  status: string;
  menu_scope: string;
  menu_mode: string;
  locale: string;
  order_flow: string;
  listing_layout: string;
  category_click_behavior: string;
  category_style: string;
  settings?: any;
}

export const emptySiteForm: SiteFormState = {
  name: "",
  slug: "",
  status: "draft",
  menu_scope: "account",
  menu_mode: "shared",
  locale: "uk",
  order_flow: "review",
  listing_layout: "grid",
  category_click_behavior: "expand",
  category_style: "tabs",
};
