import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

function buildTargetUrl(req: NextRequest, segments: string[]) {
  const baseUrl = `${ncb.env().dataUrl}/${segments.join("/")}`;
  const targetUrl = new URL(baseUrl);

  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  targetUrl.searchParams.set("Instance", ncb.env().instance);

  return targetUrl;
}

async function proxyDataRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;
  const targetUrl = buildTargetUrl(req, segments);

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${ncb.env().secretKey}`);

  const contentType = req.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const cookie = ncb.getCookie(req);
  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const upstream = await fetch(targetUrl, init);
    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get("content-type");

    if (upstreamContentType) {
      responseHeaders.set("Content-Type", upstreamContentType);
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Unexpected error" }, { status: 500 });
  }
}

export const GET = proxyDataRequest;
export const POST = proxyDataRequest;
export const PUT = proxyDataRequest;
export const DELETE = proxyDataRequest;
export const PATCH = proxyDataRequest;
