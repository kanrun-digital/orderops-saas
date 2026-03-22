"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

type BackgroundSyncMutationInput = Record<string, unknown>;

export function useBackgroundSync() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const jobsQuery = useQuery({
    queryKey: ["background-sync-jobs", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/sync_jobs?account_id=${accountId}&status[in]=pending,running&_sort=created_at&_order=desc&_limit=50`
      ).then((r) => r.data),
    enabled: !!accountId,
    refetchInterval: 5000,
  });

  const activeJobs = jobsQuery.data ?? [];
  const isSyncing = activeJobs.some((j: any) => j.status === "running");
  const lastSync = activeJobs[0]?.started_at ?? null;

  const triggerSync = (type?: string) => {
    apiPost(`/api/data/sync_jobs`, {
      account_id: accountId,
      job_type: type ?? "full_sync",
      status: "pending",
      provider: type ?? "system",
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    });
  };

  const cancelSync = () => {
    const runningJob = activeJobs.find((j: any) => j.status === "running");
    if (runningJob) {
      apiPut(`/api/data/sync_jobs/${runningJob.pk_id}`, { status: "cancelled" }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
      });
    }
  };

  return {
    isSyncing,
    lastSync,
    triggerSync,
    cancelSync,
    progress: 0,
    activeJobs,
  };
}

export function useStartBackgroundCustomerSync() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, BackgroundSyncMutationInput>({
    mutationFn: (data) =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "customer_sync",
        status: "pending",
        provider: "system",
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    },
  });

  return {
    mutate: (data: BackgroundSyncMutationInput = {}) => mutation.mutate(data),
    mutateAsync: (data: BackgroundSyncMutationInput = {}) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useStartBackgroundBitrixSync() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, BackgroundSyncMutationInput>({
    mutationFn: (data) =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "bitrix_sync",
        status: "pending",
        provider: "bitrix",
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    },
  });

  return {
    mutate: (data: BackgroundSyncMutationInput = {}) => mutation.mutate(data),
    mutateAsync: (data: BackgroundSyncMutationInput = {}) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useStartBackgroundBitrixAutoMatch() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, BackgroundSyncMutationInput>({
    mutationFn: (data) =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "bitrix_auto_match",
        status: "pending",
        provider: "bitrix",
        ...data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    },
  });

  return {
    mutate: (data: BackgroundSyncMutationInput = {}) => mutation.mutate(data),
    mutateAsync: (data: BackgroundSyncMutationInput = {}) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useCancelBackgroundSync(jobType?: string) {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, BackgroundSyncMutationInput>({
    mutationFn: async (data) => {
      const jobId = data?.jobId ?? data?.pk_id;
      if (jobId) {
        return apiPut(`/api/data/sync_jobs/${jobId}`, { status: "cancelled" });
      }
      // Cancel by type
      const jobs = await apiGet<{ data: any[] }>(
        `/api/data/sync_jobs?account_id=${accountId}&status[in]=pending,running${jobType ? `&job_type=${jobType}` : ""}&_limit=10`
      );
      return Promise.all(
        (jobs.data ?? []).map((j: any) =>
          apiPut(`/api/data/sync_jobs/${j.pk_id}`, { status: "cancelled" })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    },
  });

  return {
    mutate: (data: BackgroundSyncMutationInput = {}) => mutation.mutate(data),
    mutateAsync: (data: BackgroundSyncMutationInput = {}) => mutation.mutateAsync(data),
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export default useBackgroundSync;

export function useActiveBackgroundSyncJobs() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["active-background-sync-jobs", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/sync_jobs?account_id=${accountId}&status[in]=pending,running&_sort=created_at&_order=desc&_limit=50`
      ).then((r) => r.data),
    enabled: !!accountId,
    refetchInterval: 5000,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
