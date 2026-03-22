"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCustomerMatchLog(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer-match-log", accountId, params],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set("account_id", accountId!);
      searchParams.set("_sort", "created_at");
      searchParams.set("_order", "desc");
      searchParams.set("_limit", String(params?.limit ?? 50));
      if (params?.page) searchParams.set("_page", String(params.page));
      if (params?.decision) searchParams.set("decision", params.decision);
      if (params?.match_type) searchParams.set("match_type", params.match_type);
      if (params?.customerId) searchParams.set("customer_id", params.customerId);

      return apiGet<{ data: any[] }>(
        `/api/data/customer_match_log?${searchParams.toString()}`
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

export default useCustomerMatchLog;
