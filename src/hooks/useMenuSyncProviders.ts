"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useMenuSyncProviders(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["menu-sync-providers", accountId, params],
    queryFn: async () => {
      const [providersRes, connectionsRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/data/integration_providers?_sort=display_name&_order=asc`),
        apiGet<{ data: any[] }>(`/api/data/provider_connections?account_id=${accountId}&status=active&_sort=created_at&_order=desc`),
      ]);

      const providers = providersRes.data ?? [];
      const connections = connectionsRes.data ?? [];

      // Enrich providers with connection status
      const enriched = providers
        .filter((p: any) => connections.some((c: any) => c.provider_id === p.id))
        .map((p: any) => {
          const conn = connections.find((c: any) => c.provider_id === p.id);
          return { ...p, connectionId: conn?.id, connectionStatus: conn?.status };
        });

      const caps = (p: any) => {
        try { return JSON.parse(p.capabilities ?? "[]"); } catch { return []; }
      };

      const exportProviders = enriched.filter((p: any) => caps(p).includes("menu_export"));
      const catalogProviders = enriched.filter((p: any) => caps(p).includes("catalog") || p.category === "catalog");
      const posProvider = enriched.find((p: any) => p.category === "pos") ?? null;

      return { providers: enriched, exportProviders, catalogProviders, posProvider };
    },
    enabled: !!accountId,
  });

  return {
    data: query.data?.providers ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    providers: query.data?.providers ?? [],
    exportProviders: query.data?.exportProviders ?? [],
    catalogProviders: query.data?.catalogProviders ?? [],
    posProvider: query.data?.posProvider ?? null,
  };
}

export default useMenuSyncProviders;
