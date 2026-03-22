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
    const credentials = await ncb.read("syrve_credentials", {
      filters: { account_id: accountId, is_active: 1 },
      limit: 1,
    });
    const organizations = await ncb.read("syrve_organizations", {
      filters: { account_id: accountId, is_selected: 1 },
      limit: 1,
    });

    if (!credentials[0]) {
      return jsonError("SYRVE_CREDENTIALS_MISSING", "No active Syrve credentials found", { status: 404 });
    }
    if (!organizations[0]) {
      return jsonError("SYRVE_ORGANIZATION_MISSING", "No selected Syrve organization found", { status: 404 });
    }

    const syncJob = await createSyncJob({
      accountId,
      provider: "syrve",
      jobType: "syrve_sync_menu",
      payload: { organization_id: organizations[0].organization_id ?? organizations[0].syrve_org_id },
    });

    try {
      const tokenResponse = await fetchJson(`${SYRVE_BASE_URL}/access_token`, {
        method: "POST",
        body: JSON.stringify({ apiLogin: credentials[0].api_login }),
      });
      const token = String(tokenResponse?.token || "");
      if (!token) throw new Error("Syrve token was not returned");

      const nomenclatureResponse = await fetchJson(`${SYRVE_BASE_URL}/nomenclature`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ organizationId: organizations[0].organization_id ?? organizations[0].syrve_org_id }),
      });

      const groups = normalizeArray<any>(nomenclatureResponse?.groups);
      const products = normalizeArray<any>(nomenclatureResponse?.products);

      await Promise.all(groups.map((group, index) => {
        const payload = {
          id: crypto.randomUUID(),
          account_id: accountId,
          external_id: group.id,
          provider: "syrve",
          name: group.name ?? `Category ${index + 1}`,
          sort_order: typeof group.order === "number" ? group.order : index,
          raw_payload: JSON.stringify(group),
          created_at: now,
          updated_at: now,
        };
        return ncb.read("menu_categories", { filters: { account_id: accountId, external_id: group.id }, limit: 1 }).then((rows) =>
          rows[0]?.pk_id
            ? ncb.update("menu_categories", Number(rows[0].pk_id), { ...payload, id: rows[0].id, created_at: rows[0].created_at ?? now })
            : ncb.create("menu_categories", payload)
        );
      }));

      await Promise.all(products.map((product, index) => {
        const payload = {
          id: crypto.randomUUID(),
          account_id: accountId,
          external_id: product.id,
          provider: "syrve",
          category_external_id: product.parentGroup,
          name: product.name ?? `Product ${index + 1}`,
          sku: product.code ?? null,
          price: product.price ?? null,
          sort_order: index,
          raw_payload: JSON.stringify(product),
          created_at: now,
          updated_at: now,
        };
        return ncb.read("menu_products", { filters: { account_id: accountId, external_id: product.id }, limit: 1 }).then((rows) =>
          rows[0]?.pk_id
            ? ncb.update("menu_products", Number(rows[0].pk_id), { ...payload, id: rows[0].id, created_at: rows[0].created_at ?? now })
            : ncb.create("menu_products", payload)
        );
      }));

      const syncTime = new Date().toISOString();
      await ensureProviderConnection({
        accountId,
        providerCode: "syrve",
        status: "active",
        lastSyncAt: syncTime,
        metadata: { menu_category_count: groups.length, menu_product_count: products.length },
      });
      await updateSyncJobStatus(Number(syncJob.pk_id), "completed", { updated_at: syncTime });

      return jsonOk({
        categories_upserted: groups.length,
        products_upserted: products.length,
        organization_id: organizations[0].organization_id ?? organizations[0].syrve_org_id,
        sync_job_id: syncJob.id,
      }, { meta: { provider: "syrve", syncTarget: "menu" } });
    } catch (error: any) {
      await updateSyncJobStatus(Number(syncJob.pk_id), "failed", { error_message: error?.message || "Menu sync failed" });
      throw error;
    }
  } catch (error: any) {
    return jsonError("SYRVE_MENU_SYNC_FAILED", error?.message || "Failed to sync Syrve menu", { status: 400 });
  }
}
