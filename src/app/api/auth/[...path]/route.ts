import { NextRequest, NextResponse } from "next/server";

const NCB_CONFIG = {
  instance: process.env.NCB_INSTANCE ?? "",
  apiUrl: process.env.NCB_API_URL ?? "",
  secretKey: process.env.NCB_SECRET_KEY ?? "",
};

function assertConfig() {
  if (!NCB_CONFIG.instance || !NCB_CONFIG.apiUrl || !NCB_CONFIG.secretKey) {
    throw new Error("Missing NoCodeBackend auth proxy configuration");
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), await req.text());
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), await req.text());
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), await req.text());
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path.join("/"), await req.text());
}

function transformSetCookie(cookie: string) {
  const parts = cookie.split(";");
  const [nameValue, ...attributes] = parts.map((part) => part.trim());

  let normalizedNameValue = nameValue;
  if (nameValue.startsWith("__Secure-better-auth.")) {
    normalizedNameValue = nameValue.replace("__Secure-", "");
  } else if (nameValue.startsWith("__Host-better-auth.")) {
    normalizedNameValue = nameValue.replace("__Host-", "");
  }

  const filteredAttributes = attributes.filter((attribute) => {
    const lower = attribute.toLowerCase();
    return !lower.startsWith("domain=") && lower !== "secure";
  });

  return [normalizedNameValue, ...filteredAttributes].join("; ");
}

async function proxyRequest(req: NextRequest, path: string, body?: string) {
  assertConfig();

  const searchParams = req.nextUrl.search;
  const url = `${NCB_CONFIG.apiUrl}/${path}${searchParams}`;

  const upstreamResponse = await fetch(url, {
    method: req.method,
    headers: {
      "Content-Type": req.headers.get("content-type") ?? "application/json",
      "X-Database-Instance": NCB_CONFIG.instance,
      Authorization: `Bearer ${NCB_CONFIG.secretKey}`,
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: body || undefined,
    cache: "no-store",
  });

  const response = new NextResponse(await upstreamResponse.text(), {
    status: upstreamResponse.status,
    headers: {
      "Content-Type": upstreamResponse.headers.get("content-type") ?? "application/json",
    },
  });

  const setCookies = upstreamResponse.headers.getSetCookie?.() ?? [];
  if (setCookies.length === 0) {
    const setCookie = upstreamResponse.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("Set-Cookie", transformSetCookie(setCookie));
    }
    return response;
  }

  for (const cookie of setCookies) {
    response.headers.append("Set-Cookie", transformSetCookie(cookie));
  }

  return response;
}
