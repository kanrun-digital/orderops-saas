// ── Base entity with NCB pk_id + business UUID id ──

export interface NcbEntity {
  pk_id: number;
  id: string;
  created_at: string;
  updated_at?: string;
}

// ── Account ────────────────────────────────────

export interface Account extends NcbEntity {
  name: string;
  slug: string;
  activation_status: string;
  is_active: number;
  settings?: string | Record<string, any> | null;
  company_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  business_type?: string | null;
  business_address?: string | null;
  business_coordinates?: string | null;
  tax_id?: string | null;
  activated_at?: string | null;
  activated_by?: string | null;
  rejection_reason?: string | null;
}

// ── Account User (join table) ──────────────────

export interface AccountUser extends NcbEntity {
  account_id: string;
  user_id: string;
  role: "owner" | "admin" | "manager" | "staff" | "driver";
  is_active: number;
}

// ── Profile ────────────────────────────────────

export interface Profile extends NcbEntity {
  email: string;
  full_name: string;
  avatar_url?: string | null;
  display_name?: string;
}

// ── Customer ───────────────────────────────────

export interface Customer extends NcbEntity {
  account_id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  notes?: string;
  total_orders?: number;
  total_spent?: number;
}

// ── Menu Category ──────────────────────────────

export interface MenuCategory extends NcbEntity {
  account_id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

// ── Menu Item ──────────────────────────────────

export interface MenuItem extends NcbEntity {
  account_id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  sort_order: number;
  options?: Record<string, any>;
}

// ── Order ──────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderType = "delivery" | "pickup" | "dine_in";

export interface Order extends NcbEntity {
  account_id: string;
  customer_id?: string;
  driver_id?: string;
  order_number: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  tip: number;
  total: number;
  notes?: string;
  delivery_address?: string;
  delivery_lat?: number;
  delivery_lng?: number;
  estimated_delivery?: string;
  completed_at?: string;
}

// ── Order Item ─────────────────────────────────

export interface OrderItem extends NcbEntity {
  account_id: string;
  order_id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  options?: Record<string, any>;
  notes?: string;
}

// ── Driver ─────────────────────────────────────

export interface Driver extends NcbEntity {
  account_id: string;
  user_id?: string;
  name: string;
  phone: string;
  email?: string;
  vehicle_type?: string;
  license_plate?: string;
  status: "available" | "busy" | "offline";
  current_lat?: number;
  current_lng?: number;
}

// ── Session (from NCB auth) ────────────────────

export interface NcbSession {
  pk_id: number;
  id: string;
  email: string;
  [key: string]: any;
}

// ── API response wrappers ──────────────────────

export interface ApiError {
  error: string;
}

export interface ProvisionResponse {
  account: Account;
  profile: Profile;
  existing: boolean;
}
