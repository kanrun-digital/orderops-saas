import { NextRequest, NextResponse } from "next/server";

export const CONFIG = {
  instance: process.env.NCB_INSTANCE!,
  dataApiUrl: process.env.NCB_DATA_API_URL!,
  authApiUrl: process.env.NCB_API_URL || process.env.NCB_AUTH_API_URL || "",
  appUrl: process.env.NCB_APP_URL || "https://app.nocodebackend.com",
};

export function extractAuthCookies(cookieHeader: string): string {
  if (!cookieHeader) return "";

  const cookies = cookieHeader.split(";");
  const authCookies: string[] = [];

  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (/^(?:__Secure-)?better-auth\.session_token=/.test(trimmed) || /^(?:__Secure-)?better-auth\.session_data=/.test(trimmed)) {
      authCookies.push(trimmed);
    }
  }

  return authCookies.join("; ");
}

export async function getSessionUser(cookieHeader: string): Promise<{ id: string } | null> {
  const authCookies = extractAuthCookies(cookieHeader);
  if (!authCookies || !CONFIG.instance || !CONFIG.authApiUrl) return null;

  try {
    const url = `${CONFIG.authApiUrl}/get-session?Instance=${CONFIG.instance}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Database-Instance": CONFIG.instance,
        Cookie: authCookies,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

export async function proxyToNCB(req: NextRequest, path: string, body?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("Instance", CONFIG.instance);
  req.nextUrl.searchParams.forEach((val, key) => {
    if (key !== "Instance") searchParams.append(key, val);
  });

  const url = `${CONFIG.dataApiUrl}/${path}?${searchParams.toString()}`;
  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const cookieHeader = req.headers.get("cookie") || "";
  const authCookies = extractAuthCookies(cookieHeader);
  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      "X-Database-Instance": CONFIG.instance,
      Cookie: authCookies,
      Origin: origin,
    },
    body: body || undefined,
    cache: "no-store",
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function proxyToNCBPublic(req: NextRequest, path: string, body?: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("Instance", CONFIG.instance);
  req.nextUrl.searchParams.forEach((val, key) => {
    if (key !== "Instance") searchParams.append(key, val);
  });

  const url = `${CONFIG.dataApiUrl}/${path}?${searchParams.toString()}`;
  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const res = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      "X-Database-Instance": CONFIG.instance,
      Origin: origin,
    },
    body: body || undefined,
    cache: "no-store",
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

type RlsPolicies = Record<string, string>;

let cachedPolicies: RlsPolicies | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000;

export async function getRlsPolicies(): Promise<RlsPolicies> {
  const now = Date.now();
  if (cachedPolicies && now < cacheExpiry) return cachedPolicies;

  try {
    const url = `${CONFIG.appUrl}/api/public/rls-policies?instance=${CONFIG.instance}`;
    const res = await fetch(url, { cache: "no-store" });

    if (res.ok) {
      const data = await res.json();
      cachedPolicies = (data.policies || {}) as RlsPolicies;
      cacheExpiry = now + CACHE_TTL;
      return cachedPolicies;
    }
  } catch {
    // Ignore and fall back to cache.
  }

  return cachedPolicies || {};
}

export function extractTableFromPath(pathStr: string): string {
  const segments = pathStr.split("/");
  return segments[1] || "";
}

function parsePolicies(policy?: string): string[] {
  if (!policy) return [];
  return policy
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function allowsPublicRead(policy?: string): boolean {
  const parts = parsePolicies(policy);
  return parts.some((part) =>
    ["public_read", "public_readwrite", "public_scoped_read", "public_scoped_readwrite"].includes(part)
  );
}

export function allowsPublicWrite(policy?: string): boolean {
  const parts = parsePolicies(policy);
  return parts.some((part) =>
    ["public_write", "public_readwrite", "public_scoped_write", "public_scoped_readwrite"].includes(part)
  );
}

export function requiresOwnerScope(policy?: string): boolean {
  const parts = parsePolicies(policy);
  return parts.some((part) =>
    ["public_scoped_read", "public_scoped_write", "public_scoped_readwrite"].includes(part)
  );
}
