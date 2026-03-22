"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export interface AccountIntegrationRecord {
  id: string;
  status?: string | null;
  provider_code?: string | null;
  integration_providers?: {
    code?: string | null;
  } | null;
  [key: string]: any;
}

export interface AccountIntegrationsResult {
  connections: AccountIntegrationRecord[];
}

export function useAccountIntegrations(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["account-integrations", accountId, params],
    queryFn: () =>
      apiGet<{ data: AccountIntegrationRecord[] }>(
        `/api/data/integration_settings?account_id=${accountId}&_sort=created_at&_order=desc`
      ).then((r) => ({ connections: r.data ?? [] } as AccountIntegrationsResult)),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? { connections: [] },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useAccountIntegrations;
