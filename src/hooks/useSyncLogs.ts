"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useSyncLogs(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["sync-logs", accountId, params],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", "created_at");
      sp.set("_order", "desc");
      sp.set("_limit", String(params?.limit ?? 50));
      if (params?.page) sp.set("_page", String(params.page));
      if (params?.syncJobId) sp.set("sync_job_id", params.syncJobId);
      if (params?.level) sp.set("level", params.level);
      if (params?.status) sp.set("status", params.status);

      return apiGet<{ data: any[] }>(
        `/api/data/sync_logs?${sp.toString()}`
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

export default useSyncLogs;

export function useSyncJobs(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["sync-jobs", accountId, params],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", "created_at");
      sp.set("_order", "desc");
      sp.set("_limit", String(params?.limit ?? 50));
      if (params?.status) sp.set("status", params.status);
      if (params?.provider) sp.set("provider", params.provider);

      return apiGet<{ data: any[] }>(
        `/api/data/sync_jobs?${sp.toString()}`
      ).then((r) => r.data);
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
