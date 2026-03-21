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
  id: string | null;
  location_id: string;
  public_slug: string;
  title: string;
  status: string;
  primary_color: string;
  logo_url: string;
  dine_in_enabled: boolean;
  pickup_enabled: boolean;
  delivery_enabled: boolean;
  currency: string;
  menu_scope: string;
  menu_mode: string;
  organization_id: string | null;
  accent_color: string;
  locale: string;
  order_flow: string;
  require_customer_name: boolean;
  require_phone: boolean;
  min_order_total: number;
  listing_layout: string;
  category_click_behavior: string;
  category_style: string;
  gtm_container_id: string;
  ga_measurement_id: string;
  settings?: any;
}

export const emptySiteForm: SiteFormState = {
  id: null,
  location_id: "",
  public_slug: "",
  title: "",
  status: "draft",
  primary_color: "#27AE4F",
  logo_url: "",
  dine_in_enabled: true,
  pickup_enabled: false,
  delivery_enabled: false,
  currency: "UAH",
  menu_scope: "account",
  menu_mode: "shared",
  organization_id: null,
  accent_color: "#27AE4F",
  locale: "uk",
  order_flow: "review",
  require_customer_name: false,
  require_phone: false,
  min_order_total: 0,
  listing_layout: "grid",
  category_click_behavior: "expand",
  category_style: "tabs",
  gtm_container_id: "",
  ga_measurement_id: "",
};
