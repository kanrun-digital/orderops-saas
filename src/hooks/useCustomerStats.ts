"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCustomerStats() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer-stats", accountId],
    queryFn: async () => {
      const summaryRes = await apiGet<{ data: any[] }>(
        `/api/data/customers_summary?account_id=${accountId}&_limit=1&includeTotal=true`
      );
      const total = (summaryRes as any).total ?? summaryRes.data?.length ?? 0;

      // Estimate active = has ordered in last 30d
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const activeRes = await apiGet<{ data: any[]; total?: number }>(
        `/api/data/customers?account_id=${accountId}&last_order_at[gte]=${thirtyDaysAgo}&_limit=1&includeTotal=true`
      );
      const active = activeRes.total ?? activeRes.data?.length ?? 0;

      // New = created in last 7d
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const newRes = await apiGet<{ data: any[]; total?: number }>(
        `/api/data/customers?account_id=${accountId}&created_at[gte]=${sevenDaysAgo}&_limit=1&includeTotal=true`
      );
      const newCount = newRes.total ?? newRes.data?.length ?? 0;

      // Returning = orders_count >= 2
      const returningRes = await apiGet<{ data: any[]; total?: number }>(
        `/api/data/customers?account_id=${accountId}&orders_count[gte]=2&_limit=1&includeTotal=true`
      );
      const returning = returningRes.total ?? returningRes.data?.length ?? 0;

      const churned = total - active;

      return { total, active, new: newCount, returning, churned: Math.max(0, churned) };
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? { total: 0, active: 0, new: 0, returning: 0, churned: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useCustomerStats;
