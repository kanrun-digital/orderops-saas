"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useCustomerIngestionStats() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["customer-ingestion-stats", accountId],
    queryFn: async () => {
      const [customersRes, matchLogRes, dedupRes] = await Promise.all([
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/customers?account_id=${accountId}&_limit=1&includeTotal=true`
        ),
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/customer_match_log?account_id=${accountId}&decision=matched&_limit=1&includeTotal=true`
        ),
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/customer_dedup_candidates?account_id=${accountId}&_limit=1&includeTotal=true`
        ),
      ]);

      const total = customersRes.total ?? customersRes.data?.length ?? 0;
      const matched = matchLogRes.total ?? matchLogRes.data?.length ?? 0;
      const duplicates = dedupRes.total ?? dedupRes.data?.length ?? 0;
      const ingested = total;
      const unmatched = total - matched;

      return { total, ingested, matched, unmatched, duplicates };
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? { total: 0, ingested: 0, matched: 0, unmatched: 0, duplicates: 0 },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useCustomerIngestionStats;
