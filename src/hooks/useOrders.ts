"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useOrders(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["orders", accountId, params],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", params?.sort ?? "created_at");
      sp.set("_order", params?.order ?? "desc");
      sp.set("_limit", String(params?.limit ?? 50));
      sp.set("includeTotal", "true");
      if (params?.page) sp.set("_page", String(params.page));
      if (params?.status) sp.set("status", params.status);
      if (params?.source) sp.set("source_provider", params.source);

      return apiGet<{ data: any[] }>(
        `/api/data/orders?${sp.toString()}`
      ).then((r) => r.data);
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useOrders;

export function useOrder(id?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["order", accountId, id],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/orders?account_id=${accountId}&id=${id}&_limit=1`
      ).then((r) => r.data?.[0] ?? null),
    enabled: !!accountId && !!id,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateOrder() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/orders/${data.pk_id}`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiDelete(`/api/data/orders/${data.pk_id}`),
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

export function useAssignOrder() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPost(`/api/data/order_assignment_history`, {
        account_id: accountId,
        order_id: data.orderId,
        to_operator_id: data.operatorId,
        action: "assign",
        changed_by: data.changedBy,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-assignments"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useOrderOperators() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["order-operators", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_users?account_id=${accountId}&is_active=1`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useOrderAssignmentHistory(orderId?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["order-assignment-history", accountId, orderId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/order_assignment_history?account_id=${accountId}&order_id=${orderId}&_sort=changed_at&_order=desc`
      ).then((r) => r.data),
    enabled: !!accountId && !!orderId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
  };
}

export function useOrderAssignmentPermissions() {
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return {
    data: {
      canAssign: isAdmin,
      canReassign: isAdmin,
      canUnassign: isAdmin,
      canEditAssignments: isAdmin,
    },
  };
}
