export type SortColumn = 'created_at' | 'total' | 'status' | 'source' | 'customer_name';
export type SortDir = 'asc' | 'desc';

export interface UnifiedOrder {
  id: string;
  pk_id?: number;
  externalId?: string;
  status: string;
  source: string;
  total: number;
  currency?: string;
  customer_name?: string;
  customer_email?: string;
  customerPhone?: string;
  delivery_type?: string;
  created_at?: string;
  updated_at?: string;
  items?: any[];
  metadata?: any;
  [key: string]: any;
}

export function useOrdersServerQuery(params?: any) {
  return {
    data: [] as UnifiedOrder[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
    totalCount: 0,
    pageCount: 0,
  };
}

export default useOrdersServerQuery;
