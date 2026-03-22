"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useMenuReset() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (...args: unknown[]) => {
      const data = args[0] as any;
      return apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "menu_reset",
        status: "pending",
        provider: data?.provider ?? "system",
        payload: JSON.stringify(data?.payload ?? {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["all-menu-products"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      queryClient.invalidateQueries({ queryKey: ["menu-products"] });
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

export default useMenuReset;
