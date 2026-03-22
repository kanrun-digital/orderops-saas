"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export interface ConnectionListItem {
  id: string;
  provider_code: string;
  providerCode: string;
  name: string;
  connectionName: string;
  connectionId: string;
  status: string;
  created_at?: string;
  lastSyncAt?: string;
  lastAuthError?: string;
}

function mapToIntegrationStatus(conn: any): string {
  if (conn.last_auth_error) return "error";
  if (conn.status === "active" || conn.status === "connected") return "connected";
  if (conn.status === "disabled") return "disabled";
  return "disconnected";
}

export function useConnectionList(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["connection-list", accountId, params],
    queryFn: async () => {
      const [connectionsRes, providersRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/data/provider_connections?account_id=${accountId}&_sort=created_at&_order=desc`),
        apiGet<{ data: any[] }>(`/api/data/integration_providers?_sort=display_name&_order=asc`),
      ]);

      const connections = connectionsRes.data ?? [];
      const providers = providersRes.data ?? [];

      const mapped: ConnectionListItem[] = connections.map((c: any) => {
        const provider = providers.find((p: any) => p.id === c.provider_id);
        return {
          id: c.id,
          provider_code: provider?.code ?? c.provider_id,
          providerCode: provider?.code ?? c.provider_id,
          name: provider?.display_name ?? c.name ?? c.provider_id,
          connectionName: c.name ?? provider?.display_name ?? "",
          connectionId: c.id,
          status: mapToIntegrationStatus(c),
          created_at: c.created_at,
          lastSyncAt: c.last_sync_at,
          lastAuthError: c.last_auth_error,
        };
      });

      return { connections: mapped, providers };
    },
    enabled: !!accountId,
  });

  const connections = query.data?.connections ?? [];
  const providers = query.data?.providers ?? [];

  const posSections = connections.filter((c) =>
    providers.find((p: any) => p.id === c.provider_code || p.code === c.provider_code)?.category === "pos"
  );
  const catalogSections = connections.filter((c) =>
    providers.find((p: any) => p.id === c.provider_code || p.code === c.provider_code)?.category === "catalog"
  );
  const deliverySections = connections.filter((c) =>
    providers.find((p: any) => p.id === c.provider_code || p.code === c.provider_code)?.category === "delivery"
  );

  return {
    data: connections,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    posSections,
    catalogSections,
    deliverySections,
    mapToIntegrationStatus,
  };
}

export function useProviderConnections(provider?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["provider-connections", accountId, provider],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/provider_connections?account_id=${accountId}${provider ? `&provider_id=${provider}` : ""}&_sort=created_at&_order=desc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useConnectionList;
