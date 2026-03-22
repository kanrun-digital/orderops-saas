// ── Page Routes ────────────────────────────────

export const ROUTES = {
  home: "/",
  demo: "/demo",
  pilot: "/pilot",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
  orders: "/orders",
  orderDetail: (id: string) => `/orders/${id}`,
  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  customerSegments: "/customer-segments",
  customerSync: "/customer-sync",
  chats: "/chats",
  help: "/help",
  menu: "/menu",
  menuSources: "/menu-sources",
  menuMapping: "/menu-mapping",
  menuItem: (id: string) => `/menu/${id}`,
  settings: "/settings",
  integrations: "/integrations",
  qrMenu: "/qr-menu",
  restaurants: "/restaurants",
  deliveryZones: "/delivery-zones",
  operations: "/operations",
  sites: "/sites",
  staff: "/staff",
  reviews: "/reviews",
  syncDashboard: "/sync-dashboard",
} as const;

// ── API Routes ─────────────────────────────────

export const API_ROUTES = {
  // Auth
  signIn: "/api/auth/sign-in",
  signUp: "/api/auth/sign-up",
  signOut: "/api/auth/sign-out",
  getSession: "/api/auth/get-session",
  provision: "/api/auth/provision",
  googleAuth: "/api/auth/google",

  // Data (generic — append table name)
  data: (table: string) => `/api/data/${table}`,
  dataItem: (table: string, pkId: number) => `/api/data/${table}/${pkId}`,
} as const;
