"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export interface UnifiedSyncLog {
  id: string;
  job_type: string;
  status: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  error_message?: string;
  records_processed?: number;
}

export function useUnifiedSyncLogs(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["unified-sync-logs", accountId, params],
    queryFn: async () => {
      const [jobsRes, runsRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/data/sync_jobs?account_id=${accountId}&_sort=created_at&_order=desc&_limit=${params?.limit ?? 30}`),
        apiGet<{ data: any[] }>(`/api/data/sync_runs?account_id=${accountId}&_sort=created_at&_order=desc&_limit=${params?.limit ?? 30}`),
      ]);

      const jobs: UnifiedSyncLog[] = (jobsRes.data ?? []).map((j: any) => ({
        id: j.id,
        job_type: j.job_type ?? "unknown",
        status: j.status ?? "unknown",
        started_at: j.started_at,
        finished_at: j.finished_at,
        created_at: j.created_at,
        error_message: j.error_message,
        records_processed: undefined,
      }));

      const runs: UnifiedSyncLog[] = (runsRes.data ?? []).map((r: any) => ({
        id: r.id,
        job_type: r.provider_code ?? "sync_run",
        status: r.status ?? "unknown",
        started_at: r.started_at,
        finished_at: r.finished_at,
        created_at: r.created_at,
        error_message: r.error_text,
        records_processed: r.items_processed,
      }));

      // Merge and sort by created_at desc
      const all = [...jobs, ...runs].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return all;
    },
    enabled: !!accountId,
  });

  const logs = query.data ?? [];

  return {
    data: logs,
    logs,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useUnifiedSyncLogs;
