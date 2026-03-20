export function useCustomerSegments(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useCustomerSegments;

export function useCustomerSegment(id?: string) {
  return { data: null as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
