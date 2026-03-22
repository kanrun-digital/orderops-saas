"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCustomerDataOps() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const merge = (...args: unknown[]) => {
    const data = args[0] as any;
    setIsLoading(true);
    setError(null);
    apiPost(`/api/data/sync_jobs`, {
      account_id: accountId,
      job_type: "customer_merge",
      status: "pending",
      provider: "system",
      payload: JSON.stringify(data),
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  const deduplicate = () => {
    setIsLoading(true);
    setError(null);
    apiPost(`/api/data/sync_jobs`, {
      account_id: accountId,
      job_type: "customer_deduplicate",
      status: "pending",
      provider: "system",
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  const cleanUp = () => {
    setIsLoading(true);
    setError(null);
    apiPost(`/api/data/sync_jobs`, {
      account_id: accountId,
      job_type: "customer_cleanup",
      status: "pending",
      provider: "system",
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      })
      .catch(setError)
      .finally(() => setIsLoading(false));
  };

  return { merge, deduplicate, cleanUp, isLoading, error };
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

export default useCustomerDataOps;
