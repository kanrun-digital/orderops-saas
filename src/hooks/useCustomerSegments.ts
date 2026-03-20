export function useCustomerSegments(params?: any) {
  return {
    data: [] as any,
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
