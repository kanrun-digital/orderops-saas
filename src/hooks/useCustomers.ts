export type CustomerSortColumn = 'name' | 'email' | 'created_at' | 'orders_count' | 'total_spent' | 'last_order_at';
export type SortDirection = 'asc' | 'desc';
export type SourceFilter = 'all' | 'salesbox' | 'syrve' | 'bitrix' | 'manual' | 'matched' | 'none';

const SOURCE_FILTER_VALUES: readonly SourceFilter[] = [
  'all',
  'salesbox',
  'syrve',
  'bitrix',
  'manual',
  'matched',
  'none',
] as const;

export const isSourceFilter = (value: string): value is SourceFilter =>
  SOURCE_FILTER_VALUES.includes(value as SourceFilter);

export interface UseCustomersParams {
  page?: number;
  pageSize?: number;
  sortColumn?: CustomerSortColumn;
  sortDirection?: SortDirection;
  searchQuery?: string;
  sourceFilter?: SourceFilter;
}

export interface UseCustomersQueryParams {
  page?: string;
  pageSize?: string;
  sortBy?: CustomerSortColumn;
  sortDirection?: SortDirection;
  search?: string;
  source?: string;
  matched?: 'true';
  hasExternalId?: 'true' | 'false';
}

export function buildCustomersQueryParams(params: UseCustomersParams = {}): UseCustomersQueryParams {
  const queryParams: UseCustomersQueryParams = {};

  if (params.page) queryParams.page = String(params.page);
  if (params.pageSize) queryParams.pageSize = String(params.pageSize);
  if (params.sortColumn) queryParams.sortBy = params.sortColumn;
  if (params.sortDirection) queryParams.sortDirection = params.sortDirection;
  if (params.searchQuery) queryParams.search = params.searchQuery;

  switch (params.sourceFilter) {
    case 'matched':
      queryParams.matched = 'true';
      break;
    case 'none':
      queryParams.hasExternalId = 'false';
      break;
    case undefined:
    case 'all':
      break;
    default:
      queryParams.source = params.sourceFilter;
      break;
  }

  return queryParams;
}

export function useCustomers(params: UseCustomersParams = {}) {
  const queryParams = buildCustomersQueryParams(params);

  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
    queryParams,
  };
}

export default useCustomers;

export function useCustomer(id?: string) {
  return { data: null as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useCustomerOrders(customerId?: string) {
  return { data: [] as any, isLoading: false, error: null as Error | null };
}

export function useNeedsReviewQueue(params?: any) {
  return { data: [] as any, count: 0, isLoading: false, refetch: () => {} };
}
