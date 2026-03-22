import { NextRequest } from "next/server";
import * as ncb from "@/lib/ncb";
import { jsonError, jsonOk, parseJsonBody } from "@/lib/integrations/server";

function verifyWebhookSource(req: NextRequest) {
  const secret = process.env["SALESBOX_WEBHOOK_SECRET"];
  if (!secret) return true;
  return req.headers.get("x-salesbox-signature") === secret || req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!verifyWebhookSource(req)) {
    return jsonError("SALESBOX_WEBHOOK_FORBIDDEN", "Webhook source validation failed", { status: 403 });
  }

  const body = await parseJsonBody<Record<string, any>>(req);

  try {
    const accountId = typeof body.account_id === "string" ? body.account_id : typeof body.accountId === "string" ? body.accountId : null;
    if (!accountId) {
      return jsonError("SALESBOX_WEBHOOK_ACCOUNT_REQUIRED", "Webhook payload must include account_id", { status: 400 });
    }

    const entity = String(body.entity ?? body.type ?? "unknown");
    const eventData = (body.data ?? body.payload ?? {}) as Record<string, any>;
    const externalId = String(eventData.id ?? body.id ?? "").trim();
    if (!externalId) {
      return jsonError("SALESBOX_WEBHOOK_EXTERNAL_ID_REQUIRED", "Webhook payload must include external id", { status: 400 });
    }

    if (entity === "chat") {
      const existing = await ncb.read("salesbox_chats", { filters: { account_id: accountId, external_id: externalId }, limit: 1 });
      const payload = {
        id: existing[0]?.id ?? crypto.randomUUID(),
        account_id: accountId,
        external_id: externalId,
        salesbox_user_id: eventData.user_id ?? eventData.customer_id ?? null,
        title: eventData.title ?? eventData.subject ?? null,
        status: eventData.status ?? null,
        payload: JSON.stringify(eventData),
        created_at: existing[0]?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const record = existing[0]?.pk_id
        ? await ncb.update("salesbox_chats", Number(existing[0].pk_id), payload)
        : await ncb.create("salesbox_chats", payload);
      return jsonOk({ entity, action: body.action ?? null, record_id: record.id, external_id: externalId }, { meta: { idempotent: true } });
    }

    if (entity === "order") {
      const existing = await ncb.read("orders", { filters: { account_id: accountId, salesbox_order_id: externalId }, limit: 1 });
      const payload = {
        id: existing[0]?.id ?? crypto.randomUUID(),
        account_id: accountId,
        salesbox_order_id: externalId,
        external_id: externalId,
        source: "salesbox",
        status: eventData.status ?? existing[0]?.status ?? "unknown",
        total_amount: eventData.total ?? eventData.total_amount ?? existing[0]?.total_amount ?? null,
        raw_payload: JSON.stringify(eventData),
        created_at: existing[0]?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const record = existing[0]?.pk_id
        ? await ncb.update("orders", Number(existing[0].pk_id), payload)
        : await ncb.create("orders", payload);
      return jsonOk({ entity, action: body.action ?? null, record_id: record.id, external_id: externalId }, { meta: { idempotent: true } });
    }

    if (entity === "customer") {
      const existing = await ncb.read("customers", { filters: { account_id: accountId, salesbox_customer_id: externalId }, limit: 1 });
      const payload = {
        id: existing[0]?.id ?? crypto.randomUUID(),
        account_id: accountId,
        salesbox_customer_id: externalId,
        name: eventData.name ?? eventData.full_name ?? null,
        phone: eventData.phone ?? null,
        email: eventData.email ?? null,
        raw_payload: JSON.stringify(eventData),
        created_at: existing[0]?.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const record = existing[0]?.pk_id
        ? await ncb.update("customers", Number(existing[0].pk_id), payload)
        : await ncb.create("customers", payload);
      return jsonOk({ entity, action: body.action ?? null, record_id: record.id, external_id: externalId }, { meta: { idempotent: true } });
    }

    return jsonOk({ entity, action: body.action ?? null, ignored: true, external_id: externalId }, { meta: { idempotent: true } });
  } catch (error: any) {
    return jsonError("SALESBOX_WEBHOOK_FAILED", error?.message || "Failed to process SalesBox webhook", { status: 400 });
  }
}
