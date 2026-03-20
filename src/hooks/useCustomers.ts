export function useCustomers(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useCustomers;

export function useCustomer(id?: string) {
  return { data: null as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useCustomerOrders(customerId?: string) {
  return { data: [] as any[], isLoading: false, error: null as Error | null };
}

export function useNeedsReviewQueue(params?: Record<string, unknown>) {
  return { data: [] as any[], count: 0, isLoading: false, refetch: () => {} };
}
