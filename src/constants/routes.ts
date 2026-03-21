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

  operations: "/operations",
  analytics: "/analytics",

  customers: "/customers",
  customerDetail: (id: string) => `/customers/${id}`,
  customerSync: "/customer-sync",
  customerSegments: "/customer-segments",
  chats: "/chats",

  menu: "/menu",
  menuItem: (id: string) => `/menu/${id}`,
  stopList: "/stop-list",
  menuSources: "/menu-sources",
  menuMapping: "/menu-mapping",
  unmappedInbox: "/unmapped-inbox",

  integrations: "/integrations",
  syncDashboard: "/sync-dashboard",
  syrveAddresses: "/syrve-addresses",

  qrMenu: "/qr-menu",
  reviews: "/reviews",
  sites: "/sites",
  deliveryZones: "/delivery-zones",

  restaurants: "/restaurants",
  staff: "/staff",
  billing: "/billing",
  settings: "/settings",
  help: "/help",
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
