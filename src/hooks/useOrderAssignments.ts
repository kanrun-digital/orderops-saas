"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useOrderAssignments(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["order-assignments", accountId, params],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", "changed_at");
      sp.set("_order", "desc");
      sp.set("_limit", String(params?.limit ?? 50));
      if (params?.orderId) sp.set("order_id", params.orderId);

      return apiGet<{ data: any[] }>(
        `/api/data/order_assignment_history?${sp.toString()}`
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
      queryClient.invalidateQueries({ queryKey: ["order-assignments"] });
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

export default useOrderAssignments;
