export function useCustomers(params?: any) {
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

export function useNeedsReviewQueue(params?: any) {
  return { data: [] as any[], count: 0, isLoading: false, refetch: () => {} };
}

export type CustomerSortColumn = 'name' | 'email' | 'created_at' | 'orders_count' | 'total_spent' | 'last_order_at';
export type SortDirection = 'asc' | 'desc';
export type SourceFilter = 'all' | 'salesbox' | 'syrve' | 'bitrix' | 'manual';
