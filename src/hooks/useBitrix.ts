"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useBitrix() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bitrix", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/bitrix_connections?account_id=${accountId}&_sort=created_at&_order=desc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  const connections = query.data ?? [];
  const isConnected = connections.length > 0;

  const sync = () => {
    apiPost(`/api/data/sync_jobs`, {
      account_id: accountId,
      job_type: "bitrix_sync",
      status: "pending",
      provider: "bitrix",
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["bitrix"] });
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    });
  };

  const disconnect = () => {
    if (connections[0]?.pk_id) {
      apiDelete(`/api/data/bitrix_connections/${connections[0].pk_id}`).then(() => {
        queryClient.invalidateQueries({ queryKey: ["bitrix"] });
      });
    }
  };

  return {
    data: connections,
    isLoading: query.isLoading,
    error: query.error,
    isConnected,
    sync,
    disconnect,
    refetch: query.refetch,
  };
}

export default useBitrix;

export function useBitrixUpdateOrderStatus() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/orders/${data.pk_id}`, {
        account_id: accountId,
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}
