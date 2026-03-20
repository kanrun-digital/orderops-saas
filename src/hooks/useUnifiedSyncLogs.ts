export function useUnifiedSyncLogs(params?: any) {
  return {
    data: [] as any[],
    logs: [] as any[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

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

export default useUnifiedSyncLogs;
