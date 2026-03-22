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

const SALESBOX_BASE_URL = process.env["SALESBOX_API_BASE_URL"] || "https://openapi.salesbox.ua/api";

export async function POST(req: NextRequest) {
  const body = await parseJsonBody<Record<string, unknown>>(req);

  try {
    const { accountId, now } = await resolveAccountContext(req, body);
    const credentials = await ncb.read("salesbox_credentials", { filters: { account_id: accountId, is_active: 1 }, limit: 1 });
    if (!credentials[0]?.access_token) {
      return jsonError("SALESBOX_CREDENTIALS_MISSING", "No active SalesBox credentials found", { status: 404 });
    }

    const syncJob = await createSyncJob({ accountId, provider: "salesbox", jobType: "salesbox_sync" });

    try {
      const headers = { Authorization: `Bearer ${credentials[0].access_token}` };
      const [ordersResponse, customersResponse] = await Promise.all([
        fetchJson(`${SALESBOX_BASE_URL}/orders`, { headers }),
        fetchJson(`${SALESBOX_BASE_URL}/customers`, { headers }),
      ]);

      const orders = normalizeArray<any>(ordersResponse?.data ?? ordersResponse?.orders ?? ordersResponse);
      const customers = normalizeArray<any>(customersResponse?.data ?? customersResponse?.customers ?? customersResponse);

      for (const customer of customers) {
        const existing = await ncb.read("customers", { filters: { account_id: accountId, salesbox_customer_id: customer.id }, limit: 1 });
        const payload = {
          id: existing[0]?.id ?? crypto.randomUUID(),
          account_id: accountId,
          salesbox_customer_id: customer.id,
          name: customer.name ?? customer.full_name ?? null,
          phone: customer.phone ?? null,
          email: customer.email ?? null,
          raw_payload: JSON.stringify(customer),
          created_at: existing[0]?.created_at ?? now,
          updated_at: now,
        };
        if (existing[0]?.pk_id) await ncb.update("customers", Number(existing[0].pk_id), payload);
        else await ncb.create("customers", payload);
      }

      for (const order of orders) {
        const existing = await ncb.read("orders", { filters: { account_id: accountId, salesbox_order_id: order.id }, limit: 1 });
        const payload = {
          id: existing[0]?.id ?? crypto.randomUUID(),
          account_id: accountId,
          salesbox_order_id: order.id,
          external_id: order.id,
          source: "salesbox",
          customer_external_id: order.customer_id ?? order.customer?.id ?? null,
          status: order.status ?? "unknown",
          total_amount: order.total ?? order.total_amount ?? null,
          raw_payload: JSON.stringify(order),
          created_at: existing[0]?.created_at ?? now,
          updated_at: now,
        };
        const orderRecord = existing[0]?.pk_id
          ? await ncb.update("orders", Number(existing[0].pk_id), payload)
          : await ncb.create("orders", payload);

        await ncb.create("salesbox_orders_snapshot", {
          id: crypto.randomUUID(),
          account_id: accountId,
          order_id: orderRecord.id,
          salesbox_order_id: order.id,
          payload: JSON.stringify(order),
          created_at: now,
          updated_at: now,
        });
      }

      const syncTime = new Date().toISOString();
      await ensureProviderConnection({ accountId, providerCode: "salesbox", status: "active", lastSyncAt: syncTime });
      await updateSyncJobStatus(Number(syncJob.pk_id), "completed", { updated_at: syncTime });

      return jsonOk({
        orders_upserted: orders.length,
        customers_upserted: customers.length,
        sync_job_id: syncJob.id,
      }, { meta: { provider: "salesbox", syncTarget: "orders_customers" } });
    } catch (error: any) {
      await updateSyncJobStatus(Number(syncJob.pk_id), "failed", { error_message: error?.message || "SalesBox sync failed" });
      throw error;
    }
  } catch (error: any) {
    return jsonError("SALESBOX_SYNC_FAILED", error?.message || "Failed to sync SalesBox", { status: 400 });
  }
}
