import { NextRequest, NextResponse } from "next/server";
import * as ncb from "@/lib/ncb";

export async function GET(
  req: NextRequest,
  { params }: { params: any }
) {
  try {
    const segments = (await params).path as string[];
    const table = segments[0];
    const searchParams = req.nextUrl.searchParams;

    const filters: Record<string, string> = {};
    searchParams.forEach((v: string, k: string) => {
      if (!k.startsWith("_")) filters[k] = v;
    });

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

    return NextResponse.json(data);
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

    return NextResponse.json(data, { status: 201 });
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
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
