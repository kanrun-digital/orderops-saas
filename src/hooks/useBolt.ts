"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useBolt() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["bolt", accountId],
    queryFn: async () => {
      const [connectionsRes, storesRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/data/bolt_connections?account_id=${accountId}`),
        apiGet<{ data: any[] }>(`/api/data/bolt_stores?account_id=${accountId}&_sort=created_at&_order=desc`),
      ]);
      return {
        connections: connectionsRes.data ?? [],
        stores: storesRes.data ?? [],
      };
    },
    enabled: !!accountId,
  });

  const isConnected = (query.data?.connections?.length ?? 0) > 0;

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    isConnected,
    refetch: query.refetch,
  };
}

export default useBolt;

export function useBoltOrderAction() {
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
      queryClient.invalidateQueries({ queryKey: ["bolt"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}
