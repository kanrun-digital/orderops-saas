"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useSalesboxOrders() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["salesbox-orders", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/salesbox_orders_snapshot?account_id=${accountId}&_sort=created_at&_order=desc&_limit=100`
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

export function useSalesboxCustomers() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["salesbox-customers", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/customers?account_id=${accountId}&salesbox_customer_id[gte]=1&_sort=updated_at&_order=desc&_limit=200`
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

export function useSalesboxChatsData() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["salesbox-chats-data", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/salesbox_chats?account_id=${accountId}&_sort=updated_at&_order=desc&_limit=100`
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

export function useSalesboxClearCustomers() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "salesbox_clear_customers",
        status: "pending",
        provider: "salesbox",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesbox-customers"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useSalesboxUpdateOrderStatus() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: { orderId: string; status: string; pk_id: number }) =>
      apiPut(`/api/data/orders/${data.pk_id}`, {
        account_id: accountId,
        status: data.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesbox-orders"] });
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

export default { useSalesboxOrders, useSalesboxCustomers, useSalesboxChatsData };
