export type SortColumn = 'created_at' | 'total' | 'status' | 'source' | 'customer_name';
export type SortDir = 'asc' | 'desc';

export interface UnifiedOrder {
  id: string;
  pk_id?: number;
  externalId?: string;
  status: string;
  source: string;
  sourceProvider?: string;
  total: number;
  currency?: string;
  customerName?: string;
  customer_name?: string;
  customer_email?: string;
  customerPhone?: string;
  deliveryType?: string;
  deliveryAddress?: string;
  deliveryLatitude?: number | null;
  deliveryLongitude?: number | null;
  delivery_type?: string;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  locationName?: string;
  promoDiscount?: number;
  requiresAttention?: boolean;
  attentionReason?: string | null;
  syrveOrderId?: string | null;
  platformOrderId?: string;
  bitrixOrderId?: string;
  salesboxOrderId?: string;
  processingOperatorId?: string | null;
  processingOperatorName?: string | null;
  crmOperatorInfo?: {
    phone?: string | null;
    phoneMasked?: string | null;
    [key: string]: unknown;
  } | null;
  isRaw?: boolean;
  items?: any[];
  metadata?: any;
  [key: string]: any;
}

export interface OrdersServerQueryFacets {
  perStatus: Record<string, number>;
  perSource: Record<string, number>;
  withDiscount: number;
  withoutDiscount: number;
}

export interface OrdersServerQueryResult {
  orders: UnifiedOrder[];
  totalCount: number;
  totalPages: number;
  facets: OrdersServerQueryFacets;
  needsAttentionCount: number;
  sentToPosCount: number;
}

export function useOrdersServerQuery(params?: any) {
  return {
    data: {
      orders: [] as UnifiedOrder[],
      totalCount: 0,
      totalPages: 0,
      facets: {
        perStatus: {},
        perSource: {},
        withDiscount: 0,
        withoutDiscount: 0,
      },
      needsAttentionCount: 0,
      sentToPosCount: 0,
    } as OrdersServerQueryResult,
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
