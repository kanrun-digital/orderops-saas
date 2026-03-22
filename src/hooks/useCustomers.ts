"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

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
  const accountId = useAuthStore((s) => s.accountId);
  const queryParams = buildCustomersQueryParams(params);

  const query = useQuery({
    queryKey: ["customers", accountId, queryParams],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", params.sortColumn ?? "created_at");
      sp.set("_order", params.sortDirection ?? "desc");
      sp.set("_limit", String(params.pageSize ?? 25));
      sp.set("includeTotal", "true");
      if (params.page) sp.set("_page", String(params.page));

      if (params.searchQuery) {
        sp.set("name[like]", `%${params.searchQuery}%`);
      }

      switch (params.sourceFilter) {
        case 'salesbox':
          sp.set("salesbox_customer_id[gte]", "1");
          break;
        case 'bitrix':
          sp.set("bitrix_customer_id[gte]", "1");
          break;
        case 'syrve':
          sp.set("syrve_customer_id[gte]", "1");
          break;
        case 'matched':
          // Customers with multiple source IDs
          break;
        case 'none':
          // No external IDs
          break;
        default:
          break;
      }

      return apiGet<{ data: any[]; total?: number }>(
        `/api/data/customers?${sp.toString()}`
      ).then((r) => r.data);
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    queryParams,
  };
}

export default useCustomers;

export function useCustomer(id?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer", accountId, id],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/customers?account_id=${accountId}&id=${id}&_limit=1`
      ).then((r) => r.data?.[0] ?? null),
    enabled: !!accountId && !!id,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCustomerOrders(customerId?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer-orders", accountId, customerId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/orders?account_id=${accountId}&customer_id=${customerId}&_sort=created_at&_order=desc&_limit=100`
      ).then((r) => r.data),
    enabled: !!accountId && !!customerId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useNeedsReviewQueue(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["needs-review-queue", accountId, params],
    queryFn: () =>
      apiGet<{ data: any[]; total?: number }>(
        `/api/data/customer_match_log?account_id=${accountId}&decision=needs_review&_sort=created_at&_order=desc&_limit=${params?.limit ?? 50}&includeTotal=true`
      ).then((r) => ({ items: r.data ?? [], total: r.total ?? r.data?.length ?? 0 })),
    enabled: !!accountId,
  });

  return {
    data: query.data?.items ?? [],
    count: query.data?.total ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
