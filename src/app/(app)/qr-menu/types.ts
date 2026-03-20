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
  settings?: any;
}

export const emptySiteForm: SiteFormState = {
  name: "",
  slug: "",
  status: "draft",
};
