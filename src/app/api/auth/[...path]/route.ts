import { NextRequest, NextResponse } from "next/server";

const CONFIG = {
  instance: process.env.NCB_INSTANCE || "",
  apiUrl: process.env.NCB_AUTH_API_URL || "",
};

function validateConfig() {
  if (!CONFIG.instance || !CONFIG.apiUrl) {
    throw new Error("Missing NCB auth proxy configuration");
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path.join("/"));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  if (pathStr === "sign-out") {
    return handleSignOut(req);
  }

  return proxy(req, pathStr, await req.text());
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path.join("/"), await req.text());
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path.join("/"), await req.text());
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path.join("/"), await req.text());
}

function extractAuthCookies(cookieHeader: string): string {
  if (!cookieHeader) return "";

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(
      (cookie) =>
        cookie.endsWith("better-auth.session_token") ||
        cookie.endsWith("better-auth.session_data") ||
        cookie.startsWith("better-auth.session_token=") ||
        cookie.startsWith("better-auth.session_data=") ||
        cookie.startsWith("__Secure-better-auth.session_token=") ||
        cookie.startsWith("__Secure-better-auth.session_data=") ||
        cookie.startsWith("__Host-better-auth.session_token=") ||
        cookie.startsWith("__Host-better-auth.session_data=")
    )
    .join("; ");
}

function transformSetCookieForLocalhost(cookie: string): string {
  const parts = cookie.split(";");
  const nameValue = parts[0]?.trim() || "";

  let cleanedNameValue = nameValue;
  if (nameValue.startsWith("__Secure-better-auth.")) {
    cleanedNameValue = nameValue.replace("__Secure-", "");
  } else if (nameValue.startsWith("__Host-better-auth.")) {
    cleanedNameValue = nameValue.replace("__Host-", "");
  }

  const otherAttributes = parts
    .slice(1)
    .map((attr) => attr.trim())
    .filter((attr) => {
      const lower = attr.toLowerCase();
      return !lower.startsWith("domain=") && lower !== "secure" && !lower.startsWith("samesite=");
    });

  otherAttributes.push("SameSite=Lax");

  return [cleanedNameValue, ...otherAttributes].join("; ");
}

async function handleSignOut(req: NextRequest) {
  validateConfig();

  const response = new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

  try {
    const searchParams = new URLSearchParams();
    searchParams.set("Instance", CONFIG.instance);

    const upstreamUrl = `${CONFIG.apiUrl}/sign-out?${searchParams.toString()}`;
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const authCookies = extractAuthCookies(req.headers.get("cookie") || "");

    const upstreamResponse = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Database-Instance": CONFIG.instance,
        Cookie: authCookies,
        Origin: origin,
      },
      body: "{}",
    });

    const setCookies = upstreamResponse.headers.getSetCookie?.() || [];
    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", transformSetCookieForLocalhost(cookie));
    }
  } catch {
    // Ignore upstream sign-out failures and clear cookies locally.
  }

  for (const cookieName of [
    "better-auth.session_token",
    "better-auth.session_data",
  ]) {
    response.headers.append(
      "Set-Cookie",
      `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    );
  }

  return response;
}

async function proxy(req: NextRequest, path: string, body?: string) {
  validateConfig();

  const searchParams = new URLSearchParams(req.nextUrl.searchParams);
  searchParams.set("Instance", CONFIG.instance);

  const url = `${CONFIG.apiUrl}/${path}?${searchParams.toString()}`;
  const origin = req.headers.get("origin") || req.nextUrl.origin;
  const authCookies = extractAuthCookies(req.headers.get("cookie") || "");

  const upstreamResponse = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": req.headers.get("content-type") || "application/json",
      "X-Database-Instance": CONFIG.instance,
      Cookie: authCookies,
      Origin: origin,
    },
    body: body || undefined,
  });

  const response = new NextResponse(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": upstreamResponse.headers.get("content-type") || "application/json",
    },
  });

  const setCookies = upstreamResponse.headers.getSetCookie?.() || [];
  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", transformSetCookieForLocalhost(cookie));
  }

  return response;
}
