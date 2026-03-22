import * as ncb from "@/lib/ncb";
import { fetchJson, normalizeArray } from "@/lib/integrations/server";
import { PROVIDER_CODES } from "@/lib/constants/integrations";

const SALESBOX_BASE_URL = process.env["SALESBOX_API_BASE_URL"] || "https://openapi.salesbox.ua/api";

type PlatformServerContext = {
  accountId: string;
};

type PlatformListParams = {
  limit?: number;
  page?: number;
  status?: string;
};

type PlatformStatusUpdateInput = {
  externalId: string;
  status: string;
};

type PlatformOrderRecord = {
  id: string;
  externalId: string;
  status?: string | null;
  customerExternalId?: string | null;
  total?: number | null;
  raw: Record<string, unknown>;
};

type PlatformCustomerRecord = {
  id: string;
  externalId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  raw: Record<string, unknown>;
};

type PlatformProviderAdapter = {
  checkCredentials(context: PlatformServerContext): Promise<{
    provider: string;
    isValid: boolean;
    status: "active" | "error";
    message: string | null;
    externalAccountId?: string | null;
    raw?: unknown;
  }>;
  getOrders(context: PlatformServerContext, params?: PlatformListParams): Promise<{
    data: PlatformOrderRecord[];
    status: "ok";
    provider: string;
    meta?: Record<string, unknown>;
  }>;
  getCustomers(context: PlatformServerContext, params?: PlatformListParams): Promise<{
    data: PlatformCustomerRecord[];
    status: "ok";
    provider: string;
    meta?: Record<string, unknown>;
  }>;
  pushStatus?(context: PlatformServerContext, input: PlatformStatusUpdateInput): Promise<{
    data: {
      provider: string;
      externalId: string;
      status: string;
      updated: boolean;
      recordId?: string;
    };
    status: "ok";
  }>;
};

class UnsupportedPlatformError extends Error {
  status: number;
  code: string;

  constructor(provider: string, capability: string) {
    super(`Provider \"${provider}\" does not support ${capability} via platformApi.`);
    this.name = "UnsupportedPlatformError";
    this.status = 501;
    this.code = "PLATFORM_UNSUPPORTED";
  }
}

async function readSalesboxCredential(accountId: string) {
  const rows = await ncb.read("salesbox_credentials", {
    filters: { account_id: accountId, is_active: 1 },
    limit: 1,
  });

  const credential = rows[0] ?? null;
  if (!credential?.access_token) {
    const error = new Error("No active SalesBox credentials found");
    (error as Error & { status?: number; code?: string }).status = 404;
    (error as Error & { status?: number; code?: string }).code = "SALESBOX_CREDENTIALS_MISSING";
    throw error;
  }

  return credential;
}

function buildSalesboxHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

function normalizeSalesboxOrder(order: Record<string, unknown>): PlatformOrderRecord {
  return {
    id: String(order.id ?? order.external_id ?? ""),
    externalId: String(order.id ?? order.external_id ?? ""),
    status: typeof order.status === "string" ? order.status : null,
    customerExternalId:
      typeof order.customer_id === "string" || typeof order.customer_id === "number"
        ? String(order.customer_id)
        : typeof (order.customer as { id?: string | number } | undefined)?.id !== "undefined"
          ? String((order.customer as { id?: string | number }).id)
          : null,
    total:
      typeof order.total === "number"
        ? order.total
        : typeof order.total_amount === "number"
          ? order.total_amount
          : order.total !== null && typeof order.total !== "undefined"
            ? Number(order.total)
            : order.total_amount !== null && typeof order.total_amount !== "undefined"
              ? Number(order.total_amount)
              : null,
    raw: order,
  };
}

function normalizeSalesboxCustomer(customer: Record<string, unknown>): PlatformCustomerRecord {
  return {
    id: String(customer.id ?? customer.external_id ?? ""),
    externalId: String(customer.id ?? customer.external_id ?? ""),
    name:
      typeof customer.name === "string"
        ? customer.name
        : typeof customer.full_name === "string"
          ? customer.full_name
          : null,
    phone: typeof customer.phone === "string" ? customer.phone : null,
    email: typeof customer.email === "string" ? customer.email : null,
    raw: customer,
  };
}

function pickListMeta(records: { status?: string | null }[]) {
  const statuses = Array.from(new Set(records.map((item) => item.status).filter(Boolean)));
  return { count: records.length, statuses };
}

const salesboxAdapter: PlatformProviderAdapter = {
  async checkCredentials({ accountId }) {
    const credential = await readSalesboxCredential(accountId);
    try {
      const raw = await fetchJson(`${SALESBOX_BASE_URL}/orders?limit=1`, {
        headers: buildSalesboxHeaders(String(credential.access_token)),
      });
      return {
        provider: PROVIDER_CODES.SALESBOX,
        isValid: true,
        status: "active",
        message: null,
        externalAccountId: credential.id ?? null,
        raw,
      };
    } catch (error: any) {
      return {
        provider: PROVIDER_CODES.SALESBOX,
        isValid: false,
        status: "error",
        message: error?.message || "SalesBox credential check failed",
        externalAccountId: credential.id ?? null,
      };
    }
  },

  async getOrders({ accountId }, params) {
    const credential = await readSalesboxCredential(accountId);
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.page) sp.set("page", String(params.page));
    if (params?.status) sp.set("status", params.status);
    const raw = await fetchJson(`${SALESBOX_BASE_URL}/orders${sp.toString() ? `?${sp.toString()}` : ""}`, {
      headers: buildSalesboxHeaders(String(credential.access_token)),
    });
    const data = normalizeArray<Record<string, unknown>>(raw?.data ?? raw?.orders ?? raw).map(normalizeSalesboxOrder);
    return { data, status: "ok" as const, provider: PROVIDER_CODES.SALESBOX, meta: pickListMeta(data) };
  },

  async getCustomers({ accountId }, params) {
    const credential = await readSalesboxCredential(accountId);
    const sp = new URLSearchParams();
    if (params?.limit) sp.set("limit", String(params.limit));
    if (params?.page) sp.set("page", String(params.page));
    const raw = await fetchJson(`${SALESBOX_BASE_URL}/customers${sp.toString() ? `?${sp.toString()}` : ""}`, {
      headers: buildSalesboxHeaders(String(credential.access_token)),
    });
    const data = normalizeArray<Record<string, unknown>>(raw?.data ?? raw?.customers ?? raw).map(normalizeSalesboxCustomer);
    return { data, status: "ok" as const, provider: PROVIDER_CODES.SALESBOX, meta: { count: data.length } };
  },

  async pushStatus({ accountId }, input) {
    const rows = await ncb.read("orders", {
      filters: { account_id: accountId, salesbox_order_id: input.externalId },
      limit: 1,
    });

    const existing = rows[0] ?? null;
    if (!existing?.pk_id) {
      const error = new Error(`SalesBox order ${input.externalId} was not found in local mirror`);
      (error as Error & { status?: number; code?: string }).status = 404;
      (error as Error & { status?: number; code?: string }).code = "SALESBOX_ORDER_NOT_FOUND";
      throw error;
    }

    const updated = await ncb.update("orders", Number(existing.pk_id), {
      status: input.status,
      updated_at: new Date().toISOString(),
    });

    return {
      data: {
        provider: PROVIDER_CODES.SALESBOX,
        externalId: input.externalId,
        status: input.status,
        updated: true,
        recordId: updated.id,
      },
      status: "ok" as const,
    };
  },
};

const adapters: Partial<Record<string, PlatformProviderAdapter>> = {
  [PROVIDER_CODES.SALESBOX]: salesboxAdapter,
};

export function getPlatformAdapter(provider: string): PlatformProviderAdapter {
  const adapter = adapters[provider];
  if (!adapter) {
    throw new UnsupportedPlatformError(provider, "this operation");
  }
  return adapter;
}

export function assertPlatformCapability(provider: string, capability: keyof PlatformProviderAdapter) {
  const adapter = adapters[provider];
  if (!adapter || typeof adapter[capability] !== "function") {
    throw new UnsupportedPlatformError(provider, String(capability));
  }
  return adapter;
}

export { UnsupportedPlatformError };
