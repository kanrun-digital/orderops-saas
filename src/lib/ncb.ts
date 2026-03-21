/* ─────────────────────────────────────────────
 *  NCB (NoCodeBackend) client library
 *  Adapted for OrderOps: pk_id as PK, id as UUID
 * ───────────────────────────────────────────── */

import { NextRequest } from "next/server";

// ── Types ──────────────────────────────────────

export interface NcbEnv {
  instance: string;
  dataUrl: string;
  authUrl: string;
  secretKey: string;
}

export interface NcbSession {
  pk_id: number;
  id: string;
  email: string;
  account_id: string;
  role: string;
  [key: string]: any;
}

export interface ReadOptions {
  filters?: Record<string, string | number | boolean>;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number;
  page?: number;
}

export interface PatchByFiltersOptions {
  allowBulk?: boolean;
}

export interface PatchByFiltersResult<T = any> {
  rows: T[];
  updatedCount: number;
}

// ── Environment ────────────────────────────────

export function env(): NcbEnv {
  return {
    instance: process.env["NCB_INSTANCE"] || "",
    dataUrl: process.env["NCB_DATA_URL"] || "https://openapi.nocodebackend.com",
    authUrl: process.env["NCB_AUTH_URL"] || "https://app.nocodebackend.com/api/user-auth",
    secretKey: process.env["NCB_SECRET_KEY"] || "",
  };
}

// ── Headers ────────────────────────────────────

export function dataHeaders(): Record<string, string> {
  const e = env();
  return {
    Authorization: `Bearer ${e.secretKey}`,
    "Content-Type": "application/json",
  };
}

export function userDataHeaders(cookie: string): Record<string, string> {
  const e = env();
  return {
    Authorization: `Bearer ${e.secretKey}`,
    "Content-Type": "application/json",
    Cookie: cookie,
  };
}

// ── URL helpers ────────────────────────────────

export function withInstance(url: string): string {
  const e = env();
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}Instance=${encodeURIComponent(e.instance)}`;
}

function dataUrl(table: string): string {
  const e = env();
  return withInstance(`${e.dataUrl}/${table}`);
}

function buildQuery(base: string, options?: ReadOptions): string {
  if (!options) return base;
  const params = new URLSearchParams();
  if (options.filters) {
    for (const [k, v] of Object.entries(options.filters)) {
      params.append(k, String(v));
    }
  }
  if (options.sort) params.append("_sort", options.sort);
  if (options.order) params.append("_order", options.order);
  if (options.limit) params.append("_limit", String(options.limit));
  if (options.page) params.append("_page", String(options.page));
  const qs = params.toString();
  return qs ? `${base}&${qs}` : base;
}

// ── CRUD (server-side, secret key) ─────────────

export async function read<T = any>(
  table: string,
  options?: ReadOptions
): Promise<T[]> {
  const url = buildQuery(dataUrl(table), options);
  const res = await fetch(url, { headers: dataHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`NCB read ${table}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T[]>;
}

export async function readOne<T = any>(
  table: string,
  pkId: number
): Promise<T> {
  const url = `${dataUrl(table)}&pk_id=${pkId}`;
  const res = await fetch(url, { headers: dataHeaders(), cache: "no-store" });
  if (!res.ok) throw new Error(`NCB readOne ${table}/${pkId}: ${res.status}`);
  const rows: any = await res.json();
  if (Array.isArray(rows)) return rows[0] as T;
  return rows as T;
}

export async function findByUuid<T = any>(
  table: string,
  uuid: string
): Promise<T | null> {
  const rows = await read<T>(table, { filters: { id: uuid }, limit: 1 });
  return rows.length > 0 ? rows[0] : null;
}

export async function create<T = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const url = dataUrl(table);
  const res = await fetch(url, {
    method: "POST",
    headers: dataHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`NCB create ${table}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function createAsUser<T = any>(
  table: string,
  cookie: string,
  data: Record<string, any>
): Promise<T> {
  const url = dataUrl(table);
  const res = await fetch(url, {
    method: "POST",
    headers: userDataHeaders(cookie),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`NCB createAsUser ${table}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

export async function update(
  table: string,
  pkId: number,
  data: Record<string, any>
): Promise<any> {
  const url = `${dataUrl(table)}&pk_id=${pkId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: dataHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`NCB update ${table}/${pkId}: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function patchByFilters<T = any>(
  table: string,
  filters: Record<string, string | number | boolean>,
  data: Record<string, any>,
  options?: PatchByFiltersOptions
): Promise<PatchByFiltersResult<T>> {
  const rows = await read<any>(table, { filters });

  if (rows.length === 0) {
    throw new Error(`NCB patchByFilters: ${table} not found for provided filters`);
  }

  if (rows.length > 1 && !options?.allowBulk) {
    throw new Error(
      `Bulk update is not allowed for ${table}. Use /api/data/{table}/{pkId} or provide filters that match exactly one row.`
    );
  }

  const updatedRows = await Promise.all(
    rows.map(async (row) => {
      const pkId = Number(row?.pk_id);
      if (!pkId) {
        throw new Error(`NCB patchByFilters: ${table} row is missing pk_id`);
      }
      return update(table, pkId, data);
    })
  );

  return {
    rows: updatedRows as T[],
    updatedCount: updatedRows.length,
  };
}

export async function updateByUuid(
  table: string,
  uuid: string,
  data: Record<string, any>
): Promise<any> {
  const row = await findByUuid(table, uuid);
  if (!row) throw new Error(`NCB updateByUuid: ${table} id=${uuid} not found`);
  return update(table, (row as any).pk_id, data);
}

export async function del(table: string, pkId: number): Promise<void> {
  const url = `${dataUrl(table)}&pk_id=${pkId}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: dataHeaders(),
  });
  if (!res.ok) throw new Error(`NCB delete ${table}/${pkId}: ${res.status}`);
}

export async function search<T = any>(
  table: string,
  body: Record<string, any>
): Promise<T[]> {
  const e = env();
  const url = withInstance(`${e.dataUrl}/${table}/search`);
  const res = await fetch(url, {
    method: "POST",
    headers: dataHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`NCB search ${table}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T[]>;
}

// ── CRUD (user-context, cookie forwarded) ──────

export async function readAsUser<T = any>(
  table: string,
  cookie: string,
  options?: ReadOptions
): Promise<T[]> {
  const url = buildQuery(dataUrl(table), options);
  const res = await fetch(url, {
    headers: userDataHeaders(cookie),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`NCB readAsUser ${table}: ${res.status}`);
  return res.json() as Promise<T[]>;
}

// ── Auth helpers ───────────────────────────────

export function getCookie(req: NextRequest): string {
  return req.headers.get("cookie") || "";
}

export async function getSession(cookie: string): Promise<NcbSession | null> {
  const e = env();
  const url = `${e.authUrl}/get-session`;
  const res = await fetch(url, {
    headers: {
      Instance: e.instance,
      Cookie: cookie,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data: any = await res.json();
  if (!data || !data.email) return null;
  return data as NcbSession;
}

export async function requireAuth(req: NextRequest): Promise<NcbSession> {
  const cookie = getCookie(req);
  if (!cookie) throw new Error("No auth cookie");
  const session = await getSession(cookie);
  if (!session) throw new Error("Invalid session");
  return session;
}
