import { NextRequest, NextResponse } from "next/server";

const AUTH_URL = process.env["NCB_AUTH_URL"] || "https://app.nocodebackend.com/api/user-auth";
const INSTANCE = process.env["NCB_INSTANCE"] || "";

async function handler(req: NextRequest) {
  const segments = req.nextUrl.pathname.replace("/api/auth/", "");
  const target = `${AUTH_URL}/${segments}${req.nextUrl.search}`;

  const headers = new Headers();
  headers.set("Instance", INSTANCE);
  headers.set("Content-Type", req.headers.get("content-type") || "application/json");
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("Cookie", cookie);

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const upstream = await fetch(target, init);

  const resHeaders = new Headers();
  upstream.headers.forEach((v: string, k: string) => {
    if (k.toLowerCase() === "set-cookie" || k.toLowerCase() === "content-type") {
      resHeaders.append(k, v);
    }
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
