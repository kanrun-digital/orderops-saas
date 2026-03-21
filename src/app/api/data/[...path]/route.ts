import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

function jsonDataResponse(
  data: unknown,
  init?: ResponseInit,
  meta?: Record<string, unknown>
) {
  return NextResponse.json(meta ? { data, meta } : { data }, init);
}

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

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const segments = (await params).path as string[];
    const table = segments[0];
    const searchParams = req.nextUrl.searchParams;

    const filters = getFilters(searchParams);

    const cookie = ncb.getCookie(req);
    const options: ncb.ReadOptions = {
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      sort: searchParams.get("_sort") || undefined,
      order: (searchParams.get("_order") as "asc" | "desc") || undefined,
      limit: searchParams.has("_limit") ? Number(searchParams.get("_limit")) : undefined,
      page: searchParams.has("_page") ? Number(searchParams.get("_page")) : undefined,
    };

    const data = cookie
      ? await ncb.readAsUser(table, cookie, options)
      : await ncb.read(table, options);

    return jsonDataResponse(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const segments = (await params).path as string[];
    const table = segments[0];
    const body = (await req.json()) as any;
    const cookie = ncb.getCookie(req);

    const data = cookie
      ? await ncb.createAsUser(table, cookie, body)
      : await ncb.create(table, body);

    return jsonDataResponse(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const segments = (await params).path as string[];
    const table = segments[0];
    const body = (await req.json()) as any;

    const pkId = Number(segments[1]);
    if (!pkId) {
      return NextResponse.json({ error: "pk_id required in path" }, { status: 400 });
    }

    const data = await ncb.update(table, pkId, body);
    return jsonDataResponse(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const segments = (await params).path as string[];
    const table = segments[0];
    const body = (await req.json()) as any;
    const searchParams = req.nextUrl.searchParams;
    const filters = getFilters(searchParams);
    const pkId = Number(segments[1]);

    if (pkId) {
      const data = await ncb.update(table, pkId, body);
      return jsonDataResponse(data, undefined, { updatedCount: 1, mode: "pk_id" });
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

    return jsonDataResponse(result.rows, undefined, {
      updatedCount: result.updatedCount,
      mode: allowBulk ? "filters_bulk" : "filters",
      filters,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const segments = (await params).path as string[];
    const table = segments[0];

    const pkId = Number(segments[1]);
    if (!pkId) {
      return NextResponse.json({ error: "pk_id required in path" }, { status: 400 });
    }

    await ncb.del(table, pkId);
    return jsonDataResponse({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
