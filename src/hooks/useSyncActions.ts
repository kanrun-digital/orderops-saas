"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useSyncActions(refetch?: () => void | Promise<unknown>) {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["sync-jobs"] });
    queryClient.invalidateQueries({ queryKey: ["sync-logs"] });
    queryClient.invalidateQueries({ queryKey: ["sync-runs"] });
    queryClient.invalidateQueries({ queryKey: ["unified-sync-logs"] });
    queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    refetch?.();
  };

  const triggerSyncMutation = useMutation({
    mutationFn: (type: string) =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: type,
        status: "pending",
        provider: type.split("_")[0] ?? "system",
      }),
    onMutate: (type) => setActionInProgress(`trigger-${type}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const cancelJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      // Find the job's pk_id
      const res = await apiGet<{ data: any[] }>(
        `/api/data/sync_jobs?account_id=${accountId}&id=${jobId}&_limit=1`
      );
      const job = res.data?.[0];
      if (!job) throw new Error("Job not found");
      return apiPut(`/api/data/sync_jobs/${job.pk_id}`, { status: "cancelled" });
    },
    onMutate: (id) => setActionInProgress(`cancel-${id}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const retryJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const res = await apiGet<{ data: any[] }>(
        `/api/data/sync_jobs?account_id=${accountId}&id=${jobId}&_limit=1`
      );
      const job = res.data?.[0];
      if (!job) throw new Error("Job not found");
      return apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: job.job_type,
        status: "pending",
        provider: job.provider,
        payload: job.payload,
      });
    },
    onMutate: (id) => setActionInProgress(`retry-${id}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const cancelRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await apiGet<{ data: any[] }>(
        `/api/data/sync_runs?account_id=${accountId}&id=${runId}&_limit=1`
      );
      const run = res.data?.[0];
      if (!run) throw new Error("Run not found");
      return apiPut(`/api/data/sync_runs/${run.pk_id}`, { status: "cancelled" });
    },
    onMutate: (id) => setActionInProgress(`cancel-run-${id}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const retryRunMutation = useMutation({
    mutationFn: async (runId: string) => {
      const res = await apiGet<{ data: any[] }>(
        `/api/data/sync_runs?account_id=${accountId}&id=${runId}&_limit=1`
      );
      const run = res.data?.[0];
      if (!run) throw new Error("Run not found");
      return apiPost(`/api/data/sync_runs`, {
        account_id: accountId,
        connection_id: run.connection_id,
        provider_code: run.provider_code,
        status: "pending",
        source: "manual_retry",
      });
    },
    onMutate: (id) => setActionInProgress(`retry-run-${id}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const cancelQueueMutation = useMutation({
    mutationFn: async (queueId: string) => {
      const res = await apiGet<{ data: any[] }>(
        `/api/data/job_queue?account_id=${accountId}&id=${queueId}&_limit=1`
      );
      const job = res.data?.[0];
      if (!job) throw new Error("Queue job not found");
      return apiPut(`/api/data/job_queue/${job.pk_id}`, { status: "cancelled" });
    },
    onMutate: (id) => setActionInProgress(`cancel-queue-${id}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const retryQueueMutation = useMutation({
    mutationFn: async (queueId: string) => {
      const res = await apiGet<{ data: any[] }>(
        `/api/data/job_queue?account_id=${accountId}&id=${queueId}&_limit=1`
      );
      const job = res.data?.[0];
      if (!job) throw new Error("Queue job not found");
      return apiPut(`/api/data/job_queue/${job.pk_id}`, {
        status: "pending",
        attempts: 0,
        last_error: null,
      });
    },
    onMutate: (id) => setActionInProgress(`retry-queue-${id}`),
    onSettled: () => setActionInProgress(null),
    onSuccess: invalidateAll,
  });

  const isLoading =
    triggerSyncMutation.isPending ||
    cancelJobMutation.isPending ||
    retryJobMutation.isPending ||
    cancelRunMutation.isPending ||
    retryRunMutation.isPending ||
    cancelQueueMutation.isPending ||
    retryQueueMutation.isPending;

  return {
    triggerSync: (type: string) => triggerSyncMutation.mutate(type),
    cancelSync: (id: string) => cancelJobMutation.mutate(id),
    retrySync: (id: string) => retryJobMutation.mutate(id),
    isLoading,
    actionInProgress,
    handleCancelJob: (jobId: string) => cancelJobMutation.mutate(jobId),
    handleCancelJobQueue: (queueId: string) => cancelQueueMutation.mutate(queueId),
    handleCancelSyncRun: (runId: string) => cancelRunMutation.mutate(runId),
    handleRetryJobQueue: (queueId: string) => retryQueueMutation.mutate(queueId),
    handleRetrySyncRun: (runId: string) => retryRunMutation.mutate(runId),
  };
}

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
      if (params?.job_type) sp.set("job_type", params.job_type);

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

export default useSyncActions;
