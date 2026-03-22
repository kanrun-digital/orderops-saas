"use client";

import { updateByFilters } from '@/lib/data-client';
import { apiGet, apiPost, apiPut } from '@/services/api-client';
import { useAuthStore } from '@/stores/auth-store';

type JsonObject = Record<string, unknown>;

type SyrveCredentialsRecord = {
  pk_id?: number;
  id?: string;
  account_id?: string;
  is_active?: boolean;
  token?: string | null;
  access_token?: string | null;
  api_token?: string | null;
  auth_token?: string | null;
  token_expires_at?: string | null;
  access_token_expires_at?: string | null;
  expires_at?: string | null;
  api_login?: string | null;
  login?: string | null;
  username?: string | null;
  base_url?: string | null;
  api_base_url?: string | null;
};

type SyrveApiErrorPayload = {
  correlationId?: string;
  errorDescription?: string;
  error?: string;
  message?: string;
  description?: string;
};

export type SyrveMappedErrorKey =
  | 'orders.errors.syrveApiError'
  | 'orders.errors.syrveStatus'
  | 'orders.errors.syrveMissingOrderId';

export class SyrveMappedError extends Error {
  i18nKey: SyrveMappedErrorKey;
  i18nParams?: Record<string, string | number>;
  details?: JsonObject;

  constructor(
    message: string,
    i18nKey: SyrveMappedErrorKey = 'orders.errors.syrveApiError',
    i18nParams?: Record<string, string | number>,
    details?: JsonObject,
  ) {
    super(message);
    this.name = 'SyrveMappedError';
    this.i18nKey = i18nKey;
    this.i18nParams = i18nParams;
    this.details = details;
  }
}

export type SyrveCreateOrderResponse = {
  orderInfo?: {
    correlationId?: string;
    errorInfo?: {
      description?: string;
      message?: string;
      code?: string;
    };
    creationStatus?: string;
    order?: {
      id?: string;
      number?: string;
    };
    id?: string;
  };
};

const DEFAULT_SYRVE_BASE_URL = 'https://api-eu.syrve.live';
const TOKEN_REFRESH_SKEW_MS = 60_000;
const TOKEN_ENDPOINT = '/api/1/access_token';

function normalizeBaseUrl(url?: string | null) {
  return (url || process.env.NEXT_PUBLIC_SYRVE_BASE_URL || DEFAULT_SYRVE_BASE_URL).replace(/\/$/, '');
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function readToken(credentials: SyrveCredentialsRecord) {
  return firstString(
    credentials.token,
    credentials.access_token,
    credentials.api_token,
    credentials.auth_token,
  );
}

function readTokenExpiresAt(credentials: SyrveCredentialsRecord) {
  return firstString(
    credentials.token_expires_at,
    credentials.access_token_expires_at,
    credentials.expires_at,
  );
}

function readApiLogin(credentials: SyrveCredentialsRecord) {
  return firstString(credentials.api_login, credentials.login, credentials.username);
}

function isTokenFresh(credentials: SyrveCredentialsRecord) {
  const token = readToken(credentials);
  if (!token) return false;

  const expiresAt = readTokenExpiresAt(credentials);
  if (!expiresAt) return true;

  const expiresMs = Date.parse(expiresAt);
  if (Number.isNaN(expiresMs)) return true;

  return expiresMs - Date.now() > TOKEN_REFRESH_SKEW_MS;
}

function buildSyrveErrorMessage(payload?: SyrveApiErrorPayload | null, fallback?: string) {
  return firstString(
    payload?.errorDescription,
    payload?.description,
    payload?.message,
    payload?.error,
    fallback,
    'Syrve request failed',
  )!;
}

function mapSyrveError(message: string, details?: JsonObject, key: SyrveMappedErrorKey = 'orders.errors.syrveApiError') {
  const lowered = message.toLowerCase();

  if (lowered.includes('creationstatus') || lowered.includes('status')) {
    return new SyrveMappedError(message, 'orders.errors.syrveStatus', { status: message }, details);
  }

  if (lowered.includes('order id') && lowered.includes('missing')) {
    return new SyrveMappedError(message, 'orders.errors.syrveMissingOrderId', undefined, details);
  }

  return new SyrveMappedError(message, key, { message }, details);
}

async function getActiveCredentials(accountId?: string): Promise<SyrveCredentialsRecord> {
  const resolvedAccountId = accountId ?? useAuthStore.getState().accountId;
  if (!resolvedAccountId) {
    throw mapSyrveError('Missing account id for Syrve credentials lookup.');
  }

  const response = await apiGet<{ data: SyrveCredentialsRecord[] }>(
    `/api/data/syrve_credentials?account_id=${resolvedAccountId}&is_active=1&_limit=1`,
  );
  const credentials = response.data?.[0];

  if (!credentials) {
    throw mapSyrveError('Syrve credentials are not configured for this account.');
  }

  return credentials;
}

async function refreshSyrveToken(credentials: SyrveCredentialsRecord) {
  const apiLogin = readApiLogin(credentials);
  if (!apiLogin) {
    throw mapSyrveError('Syrve API login is missing in credentials.');
  }

  const baseUrl = normalizeBaseUrl(firstString(credentials.base_url, credentials.api_base_url));
  const response = await fetch(`${baseUrl}${TOKEN_ENDPOINT}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiLogin }),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as string | JsonObject | null;

  if (!response.ok) {
    const errorPayload = (payload && typeof payload === 'object' ? payload : null) as SyrveApiErrorPayload | null;
    throw mapSyrveError(buildSyrveErrorMessage(errorPayload, `Failed to refresh Syrve token (${response.status})`), {
      status: response.status,
      payload: (errorPayload ?? {}) as JsonObject,
    });
  }

  const token = typeof payload === 'string'
    ? payload
    : firstString((payload as JsonObject | null)?.token, (payload as JsonObject | null)?.accessToken);

  if (!token) {
    throw mapSyrveError('Syrve token refresh succeeded but token was not returned.');
  }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const patchPayload = {
    token,
    access_token: token,
    token_expires_at: expiresAt,
    access_token_expires_at: expiresAt,
    base_url: baseUrl,
  };

  if (credentials.pk_id) {
    await apiPut(`/api/data/syrve_credentials/${credentials.pk_id}`, patchPayload);
  } else if (credentials.id) {
    await updateByFilters({
      table: 'syrve_credentials',
      filters: { id: credentials.id },
      data: patchPayload,
    });
  }

  return { ...credentials, ...patchPayload } as SyrveCredentialsRecord;
}

async function ensureValidCredentials(accountId?: string) {
  const credentials = await getActiveCredentials(accountId);
  return isTokenFresh(credentials) ? credentials : refreshSyrveToken(credentials);
}

async function syrveRequest<T>(
  endpoint: string,
  options?: {
    accountId?: string;
    method?: 'GET' | 'POST';
    body?: JsonObject;
    baseUrl?: string;
  },
): Promise<T> {
  const credentials = await ensureValidCredentials(options?.accountId);
  const token = readToken(credentials);

  if (!token) {
    throw mapSyrveError('Syrve access token is missing after refresh.');
  }

  const response = await fetch(`${normalizeBaseUrl(options?.baseUrl ?? credentials.base_url ?? credentials.api_base_url)}${endpoint}`, {
    method: options?.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options?.method === 'GET' ? undefined : JSON.stringify(options?.body ?? {}),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as T | SyrveApiErrorPayload | null;
  if (!response.ok) {
    const errorPayload = (payload && typeof payload === 'object' ? payload : null) as SyrveApiErrorPayload | null;
    throw mapSyrveError(buildSyrveErrorMessage(errorPayload, `Syrve request failed with status ${response.status}`), {
      status: response.status,
      payload: (errorPayload ?? {}) as JsonObject,
    });
  }

  return (payload ?? {}) as T;
}

async function resolveOrganizations(orgIds: string[], accountId?: string) {
  if (!orgIds.length) return [] as Array<{ id: string; organizationId: string }>;
  const response = await apiGet<{ data: Array<Record<string, unknown>> }>(
    `/api/data/syrve_organizations?account_id=${accountId ?? useAuthStore.getState().accountId}&id[in]=${orgIds.join(',')}&_limit=1000`,
  );

  return (response.data ?? []).map((item) => ({
    id: String(item.id ?? ''),
    organizationId: String(item.organization_id ?? item.syrve_org_id ?? item.id ?? ''),
  })).filter((item) => item.id && item.organizationId);
}

async function resolveTerminalGroups(terminalIds: string[], accountId?: string) {
  if (!terminalIds.length) return [] as Array<{ id: string; terminalGroupId: string; organizationId?: string }>;
  const response = await apiGet<{ data: Array<Record<string, unknown>> }>(
    `/api/data/syrve_terminal_groups?account_id=${accountId ?? useAuthStore.getState().accountId}&id[in]=${terminalIds.join(',')}&_limit=1000`,
  );

  return (response.data ?? []).map((item) => ({
    id: String(item.id ?? ''),
    terminalGroupId: String(item.syrve_terminal_id ?? item.terminal_group_id ?? item.id ?? ''),
    organizationId: firstString(item.organization_id),
  })).filter((item) => item.id && item.terminalGroupId);
}

export async function fetchSyrveData(endpoint: string, params?: Record<string, unknown>) {
  try {
    const data = await syrveRequest(endpoint, {
      method: 'POST',
      body: (params ?? {}) as JsonObject,
      accountId: typeof params?.accountId === 'string' ? params.accountId : undefined,
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function syncSyrveMenu() { return { success: true }; }
export async function syncSyrveCustomers() { return { success: true }; }

export const syrveApi = {
  async getOrganizations(accountId?: string) {
    const response = await syrveRequest<{ organizations?: Array<Record<string, unknown>> }>('/api/1/organizations', {
      accountId,
      method: 'POST',
      body: { returnAdditionalInfo: true },
    });

    return {
      data: (response.organizations ?? []).map((item) => ({
        id: String(item.id ?? ''),
        organization_id: String(item.id ?? ''),
        name: String(item.name ?? ''),
      })),
    };
  },

  async getTerminalsAliveStatus(orgIds: string[], terminalIds: string[], accountId?: string) {
    const [organizations, terminalGroups] = await Promise.all([
      resolveOrganizations(orgIds, accountId),
      resolveTerminalGroups(terminalIds, accountId),
    ]);

    const organizationIds = [...new Set(organizations.map((item) => item.organizationId))];
    const terminalGroupIds = terminalGroups.map((item) => item.terminalGroupId);

    const response = await syrveRequest<{ terminalGroupsAliveStatus?: Array<Record<string, unknown>>; isAliveStatus?: Array<Record<string, unknown>> }>(
      '/api/1/terminal_groups/is_alive',
      {
        accountId,
        method: 'POST',
        body: {
          organizationIds,
          terminalGroupIds,
        },
      },
    );

    const rawList = response.terminalGroupsAliveStatus ?? response.isAliveStatus ?? [];
    const localIdBySyrveId = new Map(terminalGroups.map((item) => [item.terminalGroupId, item.id]));

    return {
      isAliveStatus: rawList.map((item) => {
        const syrveTerminalGroupId = String(item.terminalGroupId ?? '');
        return {
          terminalGroupId: localIdBySyrveId.get(syrveTerminalGroupId) ?? syrveTerminalGroupId,
          syrveTerminalGroupId,
          organizationId: String(item.organizationId ?? ''),
          isAlive: Boolean(item.isAlive),
        };
      }),
    };
  },

  async isShiftOpen(orgId: string, terminalId: string, employeeId: string, accountId?: string) {
    const [organizations, terminalGroups] = await Promise.all([
      resolveOrganizations([orgId], accountId),
      resolveTerminalGroups([terminalId], accountId),
    ]);

    const organizationId = organizations[0]?.organizationId;
    const terminalGroupId = terminalGroups[0]?.terminalGroupId;

    if (!organizationId || !terminalGroupId) {
      throw mapSyrveError('Invalid organization or terminal');
    }

    const response = await syrveRequest<{ isSessionOpened?: boolean; sessionOpened?: boolean }>(
      '/api/1/employees/is_session_opened',
      {
        accountId,
        method: 'POST',
        body: {
          organizationId,
          terminalGroupId,
          employeeId,
        },
      },
    );

    return {
      isSessionOpened: Boolean(response.isSessionOpened ?? response.sessionOpened),
    };
  },

  async createOrder(
    orderId: string,
    organizationId: string,
    terminalGroupId: string,
    options?: Record<string, unknown>,
    accountId?: string,
  ): Promise<SyrveCreateOrderResponse> {
    const [organizations, terminalGroups] = await Promise.all([
      resolveOrganizations([organizationId], accountId),
      resolveTerminalGroups([terminalGroupId], accountId),
    ]);

    const resolvedOrganizationId = organizations[0]?.organizationId ?? organizationId;
    const resolvedTerminalGroupId = terminalGroups[0]?.terminalGroupId ?? terminalGroupId;

    const response = await apiPost<any>('/api/data/sync_jobs', {
      account_id: accountId ?? useAuthStore.getState().accountId,
      job_type: 'syrve_create_order',
      status: 'pending',
      provider: 'syrve',
      payload: JSON.stringify({
        orderId,
        organizationId: resolvedOrganizationId,
        terminalGroupId: resolvedTerminalGroupId,
        ...(options ?? {}),
      }),
    });

    const normalized: SyrveCreateOrderResponse = {
      orderInfo: {
        correlationId: firstString(response?.correlationId, response?.data?.correlationId),
        creationStatus: firstString(
          response?.orderInfo?.creationStatus,
          response?.data?.creationStatus,
          response?.data?.orderInfo?.creationStatus,
          response?.status,
        ),
        errorInfo: response?.orderInfo?.errorInfo
          ?? response?.data?.errorInfo
          ?? response?.data?.orderInfo?.errorInfo
          ?? (response?.error ? { message: String(response.error) } : undefined),
        order: response?.orderInfo?.order
          ?? response?.data?.order
          ?? response?.data?.orderInfo?.order
          ?? (firstString(response?.data?.orderId, response?.orderId)
            ? { id: firstString(response?.data?.orderId, response?.orderId) }
            : undefined),
        id: firstString(
          response?.orderInfo?.id,
          response?.data?.id,
          response?.data?.orderInfo?.id,
          response?.data?.orderId,
          response?.orderId,
        ),
      },
    };

    const errorInfo = normalized.orderInfo?.errorInfo;
    if (errorInfo?.description || errorInfo?.message) {
      throw mapSyrveError(errorInfo.description || errorInfo.message || 'Syrve order creation failed', {
        orderId,
        organizationId: resolvedOrganizationId,
        terminalGroupId: resolvedTerminalGroupId,
      });
    }

    const creationStatus = normalized.orderInfo?.creationStatus?.toLowerCase();
    if (creationStatus && creationStatus !== 'success') {
      throw mapSyrveError(`Syrve returned creation status: ${normalized.orderInfo?.creationStatus}`, {
        orderId,
        organizationId: resolvedOrganizationId,
        terminalGroupId: resolvedTerminalGroupId,
      }, 'orders.errors.syrveStatus');
    }

    const createdOrderId = normalized.orderInfo?.order?.id ?? normalized.orderInfo?.id;
    if (!createdOrderId) {
      throw mapSyrveError('Syrve order id is missing in create order response.', {
        orderId,
        organizationId: resolvedOrganizationId,
        terminalGroupId: resolvedTerminalGroupId,
      }, 'orders.errors.syrveMissingOrderId');
    }

    return normalized;
  },
};
