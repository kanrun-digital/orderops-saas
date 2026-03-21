export interface User { id: string; email: string; name: string; role: string; }
export interface Account { id: string; name: string; slug: string; }
export interface Integration { id: string; provider: string; status: string; accountId: string; }
export interface SyncLog { id: string; type: string; status: string; startedAt: string; finishedAt?: string; error?: string; }
export interface Order { id: string; number: string; status: string; total: number; createdAt: string; }
export interface Customer { id: string; name: string; phone?: string; email?: string; }
export interface Product { id: string; name: string; price: number; categoryId?: string; }
export interface Category { id: string; name: string; parentId?: string; }
export type Locale = "en" | "ru" | "uk";

export interface MenuProduct {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  parent_id?: string;
  sort_order?: number;
}

export interface MenuProductExtended extends MenuProduct {
  category_name?: string;
  modifiers?: any[];
}

export interface SourceProduct {
  id: string;
  external_id: string;
  name: string;
  provider: string;
  canonicalProductId?: string | null;
  price?: number;
}

export interface UnifiedSyncLog {
  id: string;
  job_type: string;
  status: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  error_message?: string;
  records_processed?: number;
}
