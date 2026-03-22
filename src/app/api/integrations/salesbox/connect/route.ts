import { NextRequest } from "next/server";
import * as ncb from "@/lib/ncb";
import {
  ensureProviderConnection,
  fetchJson,
  jsonError,
  jsonOk,
  parseJsonBody,
  requireFields,
  resolveAccountContext,
} from "@/lib/integrations/server";

const SALESBOX_BASE_URL = process.env["SALESBOX_API_BASE_URL"] || "https://openapi.salesbox.ua/api";

export async function POST(req: NextRequest) {
  const body = await parseJsonBody<Record<string, unknown>>(req);

  try {
    requireFields(body, ["token"]);
    const { accountId, now } = await resolveAccountContext(req, body);
    const token = String(body.token).trim();

    const existing = await ncb.read("salesbox_credentials", { filters: { account_id: accountId }, limit: 1 });
    const payload = {
      id: existing[0]?.id ?? crypto.randomUUID(),
      account_id: accountId,
      access_token: token,
      is_active: 1,
      created_at: existing[0]?.created_at ?? now,
      updated_at: now,
    };

    const credential = existing[0]?.pk_id
      ? await ncb.update("salesbox_credentials", Number(existing[0].pk_id), payload)
      : await ncb.create("salesbox_credentials", payload);

    let testResponse: unknown = null;
    let authError: string | null = null;
    try {
      testResponse = await fetchJson(`${SALESBOX_BASE_URL}/orders?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      authError = error?.message || "SalesBox test request failed";
    }

    const connection = await ensureProviderConnection({
      accountId,
      providerCode: "salesbox",
      status: authError ? "error" : "active",
      lastAuthError: authError,
      metadata: { credential_id: credential.id },
    });

    return jsonOk({
      credential: {
        id: credential.id,
        account_id: accountId,
        is_active: authError ? 0 : 1,
      },
      connection,
      test_request_ok: !authError,
      test_response: testResponse,
    }, { status: authError ? 207 : 200, meta: { provider: "salesbox" } });
  } catch (error: any) {
    return jsonError("SALESBOX_CONNECT_FAILED", error?.message || "Failed to connect SalesBox", { status: 400 });
  }
}
