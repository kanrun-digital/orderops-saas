export function useCustomerMatchLog(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export function useNeedsReviewQueue(params?: Record<string, unknown>) {
  return { data: [] as any[], count: 0, isLoading: false, refetch: () => {} };
}
export default useCustomerMatchLog;
