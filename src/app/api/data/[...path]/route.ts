import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, proxyToNCB } from "@/lib/ncb-utils";

const UNAUTHORIZED = (msg = "Unauthorized") =>
  new NextResponse(JSON.stringify({ error: msg }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });

async function requireUser(req: NextRequest) {
  return getSessionUser(req.headers.get("cookie") || "");
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const user = await requireUser(req);
  if (!user) return UNAUTHORIZED();
  return proxyToNCB(req, path.join("/"));
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const body = await req.text();
  const user = await requireUser(req);
  if (!user) return UNAUTHORIZED();

  if (pathStr.startsWith("create/") && body) {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      delete parsed.user_id;
      parsed.user_id = user.id;
      return proxyToNCB(req, pathStr, JSON.stringify(parsed));
    } catch {
      // Fall through and let upstream handle invalid JSON.
    }
  }

  return proxyToNCB(req, pathStr, body);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const body = await req.text();
  const user = await requireUser(req);
  if (!user) return UNAUTHORIZED();

  if (body) {
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      delete parsed.user_id;
      return proxyToNCB(req, pathStr, JSON.stringify(parsed));
    } catch {
      // Fall through and let upstream handle invalid JSON.
    }
  }

  return proxyToNCB(req, pathStr, body);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return PUT(req, { params });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const user = await requireUser(req);
  if (!user) return UNAUTHORIZED();
  return proxyToNCB(req, path.join("/"));
}
