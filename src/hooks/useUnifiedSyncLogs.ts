export function useUnifiedSyncLogs(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useUnifiedSyncLogs;

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
