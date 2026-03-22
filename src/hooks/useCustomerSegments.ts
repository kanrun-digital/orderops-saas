"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCustomerSegments(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer-segments", accountId, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set("account_id", accountId!);
      searchParams.set("_sort", params?.sort ?? "enriched_at");
      searchParams.set("_order", params?.order ?? "desc");
      searchParams.set("_limit", String(params?.limit ?? 100));
      if (params?.page) searchParams.set("_page", String(params.page));
      if (params?.value_segment) searchParams.set("value_segment", params.value_segment);
      if (params?.recency_segment) searchParams.set("recency_segment", params.recency_segment);

      return apiGet<{ data: any[] }>(
        `/api/data/customer_segments?${searchParams.toString()}`
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
  };
}

export default useCustomerSegments;

export function useCustomerSegment(id?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer-segment", accountId, id],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/customer_segments?account_id=${accountId}&customer_id=${id}&_limit=1`
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
