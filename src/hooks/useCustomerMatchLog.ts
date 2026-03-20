export function useCustomerMatchLog(params?: any) {
  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export function useNeedsReviewQueue(params?: any) {
  return { data: [] as any, count: 0, isLoading: false, refetch: () => {} };
}
export default useCustomerMatchLog;
