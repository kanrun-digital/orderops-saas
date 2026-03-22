"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

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

export interface ParsedCrmOperatorInfo {
  phone?: string | null;
  phoneMasked?: string | null;
  _debugRawValue?: string;
  [key: string]: unknown;
}

function parseCrmOperatorInfo(value: unknown): ParsedCrmOperatorInfo | null {
  if (!value) return null;

  if (typeof value === "object") {
    return value as ParsedCrmOperatorInfo;
  }

  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object"
      ? (parsed as ParsedCrmOperatorInfo)
      : null;
  } catch {
    return process.env.NODE_ENV === "development"
      ? { _debugRawValue: value }
      : null;
  }
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
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["orders-server", accountId, params],
    queryFn: async () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", params?.sortColumn ?? "created_at");
      sp.set("_order", params?.sortDir ?? "desc");
      sp.set("_limit", String(params?.pageSize ?? 25));
      sp.set("includeTotal", "true");
      if (params?.page) sp.set("_page", String(params.page));
      if (params?.status) sp.set("status", params.status);
      if (params?.source) sp.set("source_provider", params.source);
      if (params?.search) sp.set("id[like]", `%${params.search}%`);
      if (params?.requiresAttention) sp.set("requires_attention", "1");
      if (params?.dateFrom) sp.set("created_at[gte]", params.dateFrom);
      if (params?.dateTo) sp.set("created_at[lte]", params.dateTo);

      const res = await apiGet<{ data: any[]; total?: number }>(
        `/api/data/orders?${sp.toString()}`
      );

      const orders: UnifiedOrder[] = (res.data ?? []).map((o: any) => ({
        id: o.id,
        pk_id: o.pk_id,
        externalId: o.external_order_id,
        status: o.status ?? "unknown",
        source: o.source_provider ?? "unknown",
        sourceProvider: o.source_provider,
        total: Number(o.total) || 0,
        currency: o.currency,
        customerName: o.legacy_customer_name_deprecated,
        customer_name: o.legacy_customer_name_deprecated,
        deliveryType: o.delivery_type,
        deliveryAddress: o.delivery_address,
        deliveryLatitude: o.delivery_latitude,
        deliveryLongitude: o.delivery_longitude,
        delivery_type: o.delivery_type,
        createdAt: o.created_at,
        created_at: o.created_at,
        updated_at: o.updated_at,
        promoDiscount: o.promo_discount,
        requiresAttention: !!o.requires_attention,
        attentionReason: o.attention_reason,
        syrveOrderId: o.syrve_order_id,
        platformOrderId: o.platform_order_id,
        bitrixOrderId: o.bitrix_order_id,
        salesboxOrderId: o.salesbox_order_id,
        processingOperatorId: o.processing_operator_id,
        crmOperatorInfo: parseCrmOperatorInfo(o.crm_operator_info),
      }));

      const totalCount = (res as any).total ?? orders.length;
      const pageSize = params?.pageSize ?? 25;
      const totalPages = Math.ceil(totalCount / pageSize);

      // Build facets from the fetched page (approximate)
      const perStatus: Record<string, number> = {};
      const perSource: Record<string, number> = {};
      let withDiscount = 0;
      let withoutDiscount = 0;
      let needsAttentionCount = 0;
      let sentToPosCount = 0;

      for (const o of orders) {
        perStatus[o.status] = (perStatus[o.status] ?? 0) + 1;
        perSource[o.source] = (perSource[o.source] ?? 0) + 1;
        if (o.promoDiscount && o.promoDiscount > 0) withDiscount++;
        else withoutDiscount++;
        if (o.requiresAttention) needsAttentionCount++;
        if (o.syrveOrderId) sentToPosCount++;
      }

      return {
        orders,
        totalCount,
        totalPages,
        facets: { perStatus, perSource, withDiscount, withoutDiscount },
        needsAttentionCount,
        sentToPosCount,
      } as OrdersServerQueryResult;
    },
    enabled: !!accountId,
  });

  const data = query.data ?? {
    orders: [],
    totalCount: 0,
    totalPages: 0,
    facets: { perStatus: {}, perSource: {}, withDiscount: 0, withoutDiscount: 0 },
    needsAttentionCount: 0,
    sentToPosCount: 0,
  };

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    totalCount: data.totalCount,
    pageCount: data.totalPages,
  };
}

export default useOrdersServerQuery;
