import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

function getFilters(searchParams: URLSearchParams): Record<string, string> {
  const filters: Record<string, string> = {};
  searchParams.forEach((v: string, k: string) => {
    if (!k.startsWith("_")) filters[k] = v;
  });
  return filters;
}

function isAllowedStopListBulkUpdate(
  table: string,
  filters: Record<string, string>
): boolean {
  return table === "menu_products" && filters.is_in_stop_list === "eq.true";
}

function buildTargetUrl(req: NextRequest, segments: string[]): string {
  const baseUrl = new URL(`${ncb.env().dataUrl}/${segments.map(encodeURIComponent).join("/")}`);

  req.nextUrl.searchParams.forEach((value, key) => {
    baseUrl.searchParams.append(key, value);
  });

  if (!baseUrl.searchParams.has("Instance")) {
    baseUrl.searchParams.set("Instance", ncb.env().instance);
  }

  return baseUrl.toString();
}

async function parseProxyResponse(res: Response) {
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return res.json();
  }

  const text = await res.text();
  return text.length > 0 ? text : null;
}

async function proxyDataRequest(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const targetUrl = buildTargetUrl(req, segments);
    const cookie = ncb.getCookie(req);
    const body = req.method === "GET" || req.method === "DELETE" ? undefined : await req.text();

    const upstreamRes = await fetch(targetUrl, {
      method: req.method,
      headers: cookie ? ncb.userDataHeaders(cookie) : ncb.dataHeaders(),
      body,
      cache: "no-store",
    });

    const payload = await parseProxyResponse(upstreamRes);

    if (!upstreamRes.ok) {
      const errorMessage =
        typeof payload === "string"
          ? payload
          : payload && typeof payload === "object" && "error" in payload
            ? String(payload.error)
            : `Data proxy request failed with status ${upstreamRes.status}`;

      return NextResponse.json({ error: errorMessage }, { status: upstreamRes.status });
    }

    return NextResponse.json({ data: payload }, { status: upstreamRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: segments } = await params;
    const table = segments[0];
    const body = (await req.json()) as any;
    const searchParams = req.nextUrl.searchParams;
    const filters = getFilters(searchParams);
    const pkId = Number(segments[1]);

    if (pkId) {
      const data = await ncb.update(table, pkId, body);
      return NextResponse.json({ data, meta: { updatedCount: 1, mode: "pk_id" } });
    }

    if (Object.keys(filters).length === 0) {
      return NextResponse.json(
        {
          error:
            "PATCH requires either /api/data/{table}/{pkId} or at least one filter query param such as ?id=eq...",
        },
        { status: 400 }
      );
    }

    const allowBulk = isAllowedStopListBulkUpdate(table, filters);
    const result = await ncb.patchByFilters(table, filters, body, { allowBulk });

    return NextResponse.json({
      data: result.rows,
      meta: {
        updatedCount: result.updatedCount,
        mode: allowBulk ? "filters_bulk" : "filters",
        filters,
      },
    });
  } catch (err: any) {
    const message = err?.message || "Unknown error";
    const status = /not found/i.test(message)
      ? 404
      : /bulk update/i.test(message) || /requires/i.test(message)
        ? 400
        : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export const GET = proxyDataRequest;
export const POST = proxyDataRequest;
export const PUT = proxyDataRequest;
export const DELETE = proxyDataRequest;
