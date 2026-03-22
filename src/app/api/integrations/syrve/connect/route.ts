import { NextRequest } from "next/server";
import * as ncb from "@/lib/ncb";
import {
  ensureProviderConnection,
  fetchJson,
  jsonError,
  jsonOk,
  normalizeArray,
  parseJsonBody,
  requireFields,
  resolveAccountContext,
} from "@/lib/integrations/server";

const SYRVE_BASE_URL = process.env["SYRVE_API_BASE_URL"] || "https://api-ru.iiko.services/api/1";

export async function POST(req: NextRequest) {
  const body = await parseJsonBody<Record<string, unknown>>(req);

  try {
    requireFields(body, ["api_login"]);
    const { accountId, now } = await resolveAccountContext(req, body);
    const apiLogin = String(body.api_login).trim();
    const connectionName = typeof body.connection_name === "string" && body.connection_name.trim()
      ? body.connection_name.trim()
      : "Syrve";

    const credentialPayload = {
      id: crypto.randomUUID(),
      account_id: accountId,
      api_login: apiLogin,
      is_active: 1,
      last_auth_error: null,
      created_at: now,
      updated_at: now,
    };

    const existingCredentials = await ncb.read("syrve_credentials", {
      filters: { account_id: accountId },
      limit: 1,
    });

    let credentialRecord: any;
    let token: string | null = null;
    let organizations: any[] = [];
    let authError: string | null = null;

    if (existingCredentials[0]?.pk_id) {
      credentialRecord = await ncb.update("syrve_credentials", Number(existingCredentials[0].pk_id), {
        ...credentialPayload,
        id: existingCredentials[0].id,
        created_at: existingCredentials[0].created_at ?? now,
      });
    } else {
      credentialRecord = await ncb.create("syrve_credentials", credentialPayload);
    }

    try {
      const tokenResponse = await fetchJson(`${SYRVE_BASE_URL}/access_token`, {
        method: "POST",
        body: JSON.stringify({ apiLogin }),
      });
      token = typeof tokenResponse?.token === "string" ? tokenResponse.token : null;
      if (!token) throw new Error("Syrve token was not returned");

      const orgResponse = await fetchJson(`${SYRVE_BASE_URL}/organizations`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ returnAdditionalInfo: true }),
      });

      organizations = normalizeArray<any>(orgResponse?.organizations);

      const existingOrgs = await ncb.read("syrve_organizations", {
        filters: { account_id: accountId },
        limit: 1000,
      });
      const selectedOrgId = typeof body.selected_organization_id === "string" ? body.selected_organization_id : null;

      await Promise.all(
        organizations.map((organization, index) => {
          const existing = existingOrgs.find(
            (row: any) => row.syrve_org_id === organization.id || row.organization_id === organization.id
          );
          const isSelected = selectedOrgId
            ? organization.id === selectedOrgId
            : index === 0 && !existingOrgs.some((row: any) => row.is_selected);

          const payload = {
            id: existing?.id ?? crypto.randomUUID(),
            account_id: accountId,
            credential_id: credentialRecord.id,
            organization_id: organization.id,
            syrve_org_id: organization.id,
            name: organization.name ?? `Organization ${index + 1}`,
            country: organization.country ?? null,
            restaurant_group_name: organization.restaurantGroupName ?? null,
            is_selected: isSelected ? 1 : 0,
            created_at: existing?.created_at ?? now,
            updated_at: now,
          };

          return existing?.pk_id
            ? ncb.update("syrve_organizations", Number(existing.pk_id), payload)
            : ncb.create("syrve_organizations", payload);
        })
      );
    } catch (error: any) {
      authError = error?.message || "Failed to authorize with Syrve";
      await ncb.update("syrve_credentials", Number(credentialRecord.pk_id), {
        ...credentialRecord,
        is_active: 0,
        last_auth_error: authError,
        updated_at: new Date().toISOString(),
      });
    }

    const providerConnection = await ensureProviderConnection({
      accountId,
      providerCode: "syrve",
      status: authError ? "error" : "active",
      name: connectionName,
      lastAuthError: authError,
      metadata: {
        credential_id: credentialRecord.id,
        organization_count: organizations.length,
      },
    });

    return jsonOk({
      connection: providerConnection,
      credential: {
        id: credentialRecord.id,
        account_id: accountId,
        api_login: apiLogin,
        is_active: authError ? 0 : 1,
        last_auth_error: authError,
      },
      organizations: organizations.map((organization: any) => ({
        id: organization.id,
        name: organization.name ?? null,
      })),
      token_received: !!token,
    }, {
      status: authError ? 207 : 200,
      meta: {
        provider: "syrve",
        connected: !authError,
        organizationCount: organizations.length,
      },
    });
  } catch (error: any) {
    return jsonError("SYRVE_CONNECT_FAILED", error?.message || "Failed to connect Syrve", { status: 400 });
  }
}
