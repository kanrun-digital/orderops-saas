export function useSyncLogs(params?: any) {
  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useSyncLogs;
export function useSyncJobs(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
