import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ApiSuccess<T extends JsonValue | Record<string, unknown>> = {
  ok: true;
  data: T;
  error: null;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  ok: false;
  data: null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: Record<string, unknown>;
};

export function jsonOk<T extends JsonValue | Record<string, unknown>>(
  data: T,
  init?: { status?: number; meta?: Record<string, unknown> }
) {
  return NextResponse.json<ApiSuccess<T>>(
    { ok: true, data, error: null, meta: init?.meta },
    { status: init?.status ?? 200 }
  );
}

export function jsonError(
  code: string,
  message: string,
  init?: { status?: number; details?: unknown; meta?: Record<string, unknown> }
) {
  return NextResponse.json<ApiFailure>(
    { ok: false, data: null, error: { code, message, details: init?.details }, meta: init?.meta },
    { status: init?.status ?? 400 }
  );
}

export async function parseJsonBody<T = Record<string, unknown>>(req: NextRequest): Promise<T> {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {} as T;
  return (await req.json()) as T;
}

export async function resolveAccountContext(req: NextRequest, body?: Record<string, unknown>) {
  const session = await ncb.requireAuth(req);
  const accountId =
    typeof body?.account_id === "string" && body.account_id.trim().length > 0
      ? body.account_id.trim()
      : typeof body?.accountId === "string" && body.accountId.trim().length > 0
        ? body.accountId.trim()
        : session.account_id ?? null;

  if (!accountId) {
    throw new Error("Account context is required");
  }

  return {
    session,
    accountId,
    now: new Date().toISOString(),
  };
}

export async function findProviderByCode(code: string) {
  const rows = await ncb.read("integration_providers", { filters: { code }, limit: 1 });
  return rows[0] ?? null;
}

export async function upsertByFilters(
  table: string,
  filters: Record<string, string | number | boolean>,
  payload: Record<string, unknown>
) {
  const rows = await ncb.read(table, { filters, limit: 1 });
  if (rows[0]?.pk_id) {
    return {
      mode: "updated" as const,
      record: await ncb.update(table, Number(rows[0].pk_id), payload),
      existing: rows[0],
    };
  }

  return {
    mode: "created" as const,
    record: await ncb.create(table, payload),
    existing: null,
  };
}

export async function ensureProviderConnection(input: {
  accountId: string;
  providerCode: string;
  status: string;
  name?: string;
  lastAuthError?: string | null;
  lastSyncAt?: string | null;
  metadata?: Record<string, unknown> | null;
}) {
  const provider = await findProviderByCode(input.providerCode);
  const providerId = provider?.id ?? input.providerCode;
  const now = new Date().toISOString();
  const payload = {
    id: crypto.randomUUID(),
    account_id: input.accountId,
    provider_id: providerId,
    name: input.name ?? provider?.display_name ?? input.providerCode,
    status: input.status,
    last_auth_error: input.lastAuthError ?? null,
    last_sync_at: input.lastSyncAt ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    created_at: now,
    updated_at: now,
  };

  const existingRows = await ncb.read("provider_connections", {
    filters: { account_id: input.accountId, provider_id: providerId },
    limit: 1,
  });

  if (existingRows[0]?.pk_id) {
    return ncb.update("provider_connections", Number(existingRows[0].pk_id), {
      ...payload,
      id: existingRows[0].id,
      created_at: existingRows[0].created_at ?? now,
    });
  }

  return ncb.create("provider_connections", payload);
}

export async function createSyncJob(input: {
  accountId: string;
  provider: string;
  jobType: string;
  status?: string;
  payload?: Record<string, unknown> | null;
}) {
  const now = new Date().toISOString();
  return ncb.create("sync_jobs", {
    id: crypto.randomUUID(),
    account_id: input.accountId,
    provider: input.provider,
    job_type: input.jobType,
    status: input.status ?? "running",
    payload: input.payload ? JSON.stringify(input.payload) : null,
    created_at: now,
    updated_at: now,
  });
}

export async function updateSyncJobStatus(syncJobPkId: number | null, status: string, extra?: Record<string, unknown>) {
  if (!syncJobPkId) return null;
  return ncb.update("sync_jobs", syncJobPkId, {
    status,
    updated_at: new Date().toISOString(),
    ...(extra ?? {}),
  });
}

export function normalizeArray<T>(value: unknown, fallback: T[] = []): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export async function fetchJson(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      typeof data?.errorDescription === "string"
        ? data.errorDescription
        : typeof data?.message === "string"
          ? data.message
          : `External request failed with status ${response.status}`
    );
  }

  return data;
}

export function requireFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => {
    const value = body[field];
    return !(typeof value === "string" && value.trim().length > 0);
  });

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
}
