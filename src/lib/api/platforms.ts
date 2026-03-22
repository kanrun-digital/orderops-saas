import { PROVIDER_CODES, PROVIDER_DISPLAY_NAMES } from "@/lib/constants/integrations";

export const PLATFORMS = [
  "syrve",
  "poster",
  "joinposter",
  "checkbox",
  "bitrix",
  "salesbox",
  PROVIDER_CODES.BOLT_FOOD,
  PROVIDER_CODES.GLOVO,
  PROVIDER_CODES.WOLT,
  PROVIDER_CODES.UBER_EATS,
  PROVIDER_CODES.MENU_UA,
] as const;

export type Platform = (typeof PLATFORMS)[number];
export type PlatformEntity = "orders" | "customers";

export type PlatformCredentialCheckResult = {
  provider: string;
  isValid: boolean;
  status: "active" | "error";
  message: string | null;
  externalAccountId?: string | null;
  raw?: unknown;
};

export type PlatformRecord = {
  id: string;
  externalId: string;
  status?: string | null;
  raw: Record<string, unknown>;
  [key: string]: unknown;
};

export type PlatformCollectionResponse<T extends PlatformRecord = PlatformRecord> = {
  data: T[];
  status: "ok";
  provider: string;
  meta?: Record<string, unknown>;
};

export type PlatformStatusUpdateResponse = {
  data: {
    provider: string;
    externalId: string;
    status: string;
    updated: boolean;
    recordId?: string;
  };
  status: "ok";
};

class PlatformApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.name = "PlatformApiError";
    this.status = status;
    this.code = code;
  }
}

function getPlatformPath(provider: string, path: string) {
  return `/api/platforms/${provider}${path.startsWith("/") ? path : `/${path}`}`;
}

async function requestPlatform<T>(provider: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(getPlatformPath(provider, path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.ok === false) {
    throw new PlatformApiError(
      payload?.error?.message ?? `Platform request failed: ${response.status}`,
      response.status,
      payload?.error?.code,
    );
  }

  return payload?.data as T;
}

export function getPlatformLabel(p: string): string {
  return PROVIDER_DISPLAY_NAMES[p] ?? p;
}

export function getPlatformIcon(p: string): string {
  return p;
}

export const platformApi = {
  checkCredentials(provider: string) {
    return requestPlatform<PlatformCredentialCheckResult>(provider, "/credentials/check");
  },
  getOrders<T extends PlatformRecord = PlatformRecord>(provider: string, params?: Record<string, string | number | boolean | null | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      sp.set(key, String(value));
    });
    const suffix = sp.toString();
    return requestPlatform<PlatformCollectionResponse<T>>(provider, `/orders${suffix ? `?${suffix}` : ""}`);
  },
  getCustomers<T extends PlatformRecord = PlatformRecord>(provider: string, params?: Record<string, string | number | boolean | null | undefined>) {
    const sp = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      sp.set(key, String(value));
    });
    const suffix = sp.toString();
    return requestPlatform<PlatformCollectionResponse<T>>(provider, `/customers${suffix ? `?${suffix}` : ""}`);
  },
  pushStatus(provider: string, externalId: string, status: string, body?: Record<string, unknown>) {
    return requestPlatform<PlatformStatusUpdateResponse>(provider, `/orders/${encodeURIComponent(externalId)}/status`, {
      method: "POST",
      body: JSON.stringify({ status, ...(body ?? {}) }),
    });
  },
};

export { PlatformApiError };
