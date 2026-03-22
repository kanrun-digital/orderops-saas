import { NextRequest } from "next/server";
import * as ncb from "@/lib/ncb";
import {
  createSyncJob,
  ensureProviderConnection,
  fetchJson,
  jsonError,
  jsonOk,
  normalizeArray,
  parseJsonBody,
  resolveAccountContext,
  updateSyncJobStatus,
} from "@/lib/integrations/server";

const SYRVE_BASE_URL = process.env["SYRVE_API_BASE_URL"] || "https://api-ru.iiko.services/api/1";

export async function POST(req: NextRequest) {
  const body = await parseJsonBody<Record<string, unknown>>(req);

  try {
    const { accountId, now } = await resolveAccountContext(req, body);
    const from = typeof body.from === "string" ? body.from : new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const to = typeof body.to === "string" ? body.to : new Date().toISOString();

    const credentials = await ncb.read("syrve_credentials", { filters: { account_id: accountId, is_active: 1 }, limit: 1 });
    const organizations = await ncb.read("syrve_organizations", { filters: { account_id: accountId, is_selected: 1 }, limit: 1 });

    if (!credentials[0] || !organizations[0]) {
      return jsonError("SYRVE_CONTEXT_MISSING", "Syrve credentials or selected organization are missing", { status: 404 });
    }

    const syncJob = await createSyncJob({
      accountId,
      provider: "syrve",
      jobType: "syrve_sync_orders",
      payload: { from, to, organization_id: organizations[0].organization_id ?? organizations[0].syrve_org_id },
    });

    try {
      const tokenResponse = await fetchJson(`${SYRVE_BASE_URL}/access_token`, {
        method: "POST",
        body: JSON.stringify({ apiLogin: credentials[0].api_login }),
      });
      const token = String(tokenResponse?.token || "");
      if (!token) throw new Error("Syrve token was not returned");

      const ordersResponse = await fetchJson(`${SYRVE_BASE_URL}/deliveries/by_delivery_date`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          organizationId: organizations[0].organization_id ?? organizations[0].syrve_org_id,
          from,
          to,
        }),
      });

      const orders = normalizeArray<any>(ordersResponse?.orders ?? ordersResponse?.deliveries ?? ordersResponse);
      let itemsUpserted = 0;

      for (const order of orders) {
        const existingOrders = await ncb.read("orders", {
          filters: { account_id: accountId, syrve_order_id: order.id },
          limit: 1,
        });
        const orderPayload = {
          id: existingOrders[0]?.id ?? crypto.randomUUID(),
          account_id: accountId,
          syrve_order_id: order.id,
          external_id: order.id,
          source: "syrve",
          status: order.status ?? order.orderStatus ?? "unknown",
          total_amount: order.sum ?? order.totalSum ?? null,
          occurred_at: order.whenCreated ?? order.createdAt ?? now,
          raw_payload: JSON.stringify(order),
          sync_status: "synced",
          created_at: existingOrders[0]?.created_at ?? now,
          updated_at: now,
        };
        const orderRecord = existingOrders[0]?.pk_id
          ? await ncb.update("orders", Number(existingOrders[0].pk_id), orderPayload)
          : await ncb.create("orders", orderPayload);

        const items = normalizeArray<any>(order.items ?? order.order?.items);
        for (const item of items) {
          itemsUpserted += 1;
          const existingItems = await ncb.read("order_items", {
            filters: { account_id: accountId, order_id: orderRecord.id, external_id: item.id ?? `${order.id}:${item.productId}` },
            limit: 1,
          });
          const itemPayload = {
            id: existingItems[0]?.id ?? crypto.randomUUID(),
            account_id: accountId,
            order_id: orderRecord.id,
            external_id: item.id ?? `${order.id}:${item.productId}`,
            product_name: item.name ?? item.product ?? "Unknown item",
            quantity: item.amount ?? item.quantity ?? 1,
            unit_price: item.price ?? item.sum ?? null,
            raw_payload: JSON.stringify(item),
            created_at: existingItems[0]?.created_at ?? now,
            updated_at: now,
          };
          if (existingItems[0]?.pk_id) {
            await ncb.update("order_items", Number(existingItems[0].pk_id), itemPayload);
          } else {
            await ncb.create("order_items", itemPayload);
          }
        }
      }

      const syncTime = new Date().toISOString();
      await ensureProviderConnection({ accountId, providerCode: "syrve", status: "active", lastSyncAt: syncTime });
      await updateSyncJobStatus(Number(syncJob.pk_id), "completed", { updated_at: syncTime });

      return jsonOk({
        orders_upserted: orders.length,
        order_items_upserted: itemsUpserted,
        from,
        to,
        sync_job_id: syncJob.id,
      }, { meta: { provider: "syrve", syncTarget: "orders" } });
    } catch (error: any) {
      await updateSyncJobStatus(Number(syncJob.pk_id), "failed", { error_message: error?.message || "Order sync failed" });
      throw error;
    }
  } catch (error: any) {
    return jsonError("SYRVE_ORDER_SYNC_FAILED", error?.message || "Failed to sync Syrve orders", { status: 400 });
  }
}
