"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCustomerBulkPush() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (...args: unknown[]) => {
      const data = args[0] as any;
      return apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "customer_bulk_push",
        status: "pending",
        provider: data?.provider ?? "syrve",
        payload: JSON.stringify(data?.payload ?? {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export default useCustomerBulkPush;
