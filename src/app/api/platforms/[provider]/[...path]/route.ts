import { NextRequest } from "next/server";
import { jsonError, jsonOk, parseJsonBody, resolveAccountContext } from "@/lib/integrations/server";
import { getPlatformAdapter } from "@/lib/api/platforms/server";

function toPositiveInt(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string; path: string[] }> },
) {
  const { provider, path } = await params;

  try {
    const { accountId } = await resolveAccountContext(req);
    const adapter = getPlatformAdapter(provider);

    if (path.length === 2 && path[0] === "credentials" && path[1] === "check") {
      const result = await adapter.checkCredentials({ accountId });
      return jsonOk(result, { meta: { provider } });
    }

    if (path.length === 1 && path[0] === "orders") {
      const result = await adapter.getOrders({ accountId }, {
        limit: toPositiveInt(req.nextUrl.searchParams.get("limit")),
        page: toPositiveInt(req.nextUrl.searchParams.get("page")),
        status: req.nextUrl.searchParams.get("status") ?? undefined,
      });
      return jsonOk(result, { meta: { provider, entity: "orders" } });
    }

    if (path.length === 1 && path[0] === "customers") {
      const result = await adapter.getCustomers({ accountId }, {
        limit: toPositiveInt(req.nextUrl.searchParams.get("limit")),
        page: toPositiveInt(req.nextUrl.searchParams.get("page")),
      });
      return jsonOk(result, { meta: { provider, entity: "customers" } });
    }

    return jsonError("PLATFORM_ROUTE_NOT_FOUND", `Unsupported platform GET route: /${path.join("/")}`, { status: 404 });
  } catch (error: any) {
    return jsonError(error?.code || "PLATFORM_REQUEST_FAILED", error?.message || "Platform request failed", {
      status: error?.status || 400,
      meta: { provider },
    });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string; path: string[] }> },
) {
  const { provider, path } = await params;

  try {
    const { accountId } = await resolveAccountContext(req);
    const adapter = getPlatformAdapter(provider);
    const body = await parseJsonBody<Record<string, unknown>>(req);

    if (path.length === 3 && path[0] === "orders" && path[2] === "status") {
      if (!adapter.pushStatus) {
        return jsonError("PLATFORM_UNSUPPORTED", `Provider \"${provider}\" does not support status updates.`, { status: 501 });
      }

      const status = typeof body.status === "string" ? body.status.trim() : "";
      if (!status) {
        return jsonError("PLATFORM_STATUS_REQUIRED", "Status is required", { status: 400 });
      }

      const result = await adapter.pushStatus({ accountId }, {
        externalId: decodeURIComponent(path[1]),
        status,
      });
      return jsonOk(result, { meta: { provider, entity: "orders", action: "status" } });
    }

    return jsonError("PLATFORM_ROUTE_NOT_FOUND", `Unsupported platform POST route: /${path.join("/")}`, { status: 404 });
  } catch (error: any) {
    return jsonError(error?.code || "PLATFORM_REQUEST_FAILED", error?.message || "Platform request failed", {
      status: error?.status || 400,
      meta: { provider },
    });
  }
}
