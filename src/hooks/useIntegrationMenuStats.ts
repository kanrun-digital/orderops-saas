"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useIntegrationMenuStats(_provider?: string, _enabled?: boolean) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["integration-menu-stats", accountId, _provider],
    queryFn: async () => {
      const [productsRes, categoriesRes, mappingsRes] = await Promise.all([
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/menu_products?account_id=${accountId}&_limit=1&includeTotal=true`
        ),
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/menu_categories?account_id=${accountId}&_limit=1&includeTotal=true`
        ),
        apiGet<{ data: any[]; total?: number }>(
          `/api/data/external_item_mappings?account_id=${accountId}${_provider ? `&provider=${_provider}` : ""}&canonical_entity_type=menu_product&_limit=1&includeTotal=true`
        ),
      ]);

      const totalProducts = productsRes.total ?? productsRes.data?.length ?? 0;
      const mappedProducts = mappingsRes.total ?? mappingsRes.data?.length ?? 0;
      const categories = categoriesRes.total ?? categoriesRes.data?.length ?? 0;

      return {
        totalProducts,
        mappedProducts,
        unmappedProducts: Math.max(0, totalProducts - mappedProducts),
        categories,
      };
    },
    enabled: !!accountId && _enabled !== false,
  });

  return {
    data: query.data ?? { totalProducts: 0, mappedProducts: 0, unmappedProducts: 0, categories: 0 },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export default useIntegrationMenuStats;
