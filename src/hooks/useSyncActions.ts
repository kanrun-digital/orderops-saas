export function useSyncActions() {
  return {
    triggerSync: (type: string) => {},
    cancelSync: (id: string) => {},
    retrySync: (id: string) => {},
    isLoading: false,
    actionInProgress: null as string | null,
    handleCancelJob: (jobId: string) => {},
    handleCancelJobQueue: (queueId: string) => {},
    handleCancelSyncRun: (runId: string) => {},
    handleRetryJobQueue: (queueId: string) => {},
    handleRetrySyncRun: (runId: string) => {},
  };
}

export function useSyncJobs(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export default useSyncActions;
