export function useSyncActions() {
  return {
    triggerSync: (type: string) => {},
    cancelSync: (id: string) => {},
    retrySync: (id: string) => {},
    isLoading: false,
  };
}
export default useSyncActions;

export function useSyncJobs(params?: any) {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
