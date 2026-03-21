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
  menu: "/menu",
  menuItem: (id: string) => `/menu/${id}`,
  settings: "/settings",
  settingsTeam: "/settings/team",
  settingsBilling: "/settings/billing",
  settingsIntegrations: "/settings/integrations",
  reports: "/reports",
  drivers: "/drivers",
  driverDetail: (id: string) => `/drivers/${id}`,
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
