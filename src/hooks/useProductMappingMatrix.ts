"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useProductMappingMatrix(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["product-mapping-matrix", accountId, params],
    queryFn: async () => {
      const [productsRes, mappingsRes, providersRes] = await Promise.all([
        apiGet<{ data: any[] }>(
          `/api/data/menu_products?account_id=${accountId}&_sort=name&_order=asc&_limit=500`
        ),
        apiGet<{ data: any[] }>(
          `/api/data/external_item_mappings?account_id=${accountId}&canonical_entity_type=menu_product&_limit=2000`
        ),
        apiGet<{ data: any[] }>(
          `/api/data/provider_connections?account_id=${accountId}&status=active`
        ),
      ]);

      const products = productsRes.data ?? [];
      const mappings = mappingsRes.data ?? [];
      const connections = providersRes.data ?? [];

      const providerColumns = connections.map((c: any) => ({
        id: c.provider_id ?? c.id,
        name: c.name ?? c.provider_id,
        connectionId: c.id,
      }));

      // Build a lookup: productId -> provider -> mapping
      const mappingLookup = new Map<string, Map<string, any>>();
      for (const m of mappings) {
        if (!mappingLookup.has(m.canonical_entity_id)) {
          mappingLookup.set(m.canonical_entity_id, new Map());
        }
        mappingLookup.get(m.canonical_entity_id)!.set(m.provider, m);
      }

      const matrix = products.map((p: any) => ({
        ...p,
        mappings: Object.fromEntries(mappingLookup.get(p.id)?.entries() ?? []),
      }));

      return { matrix, providerColumns, mappingLookup };
    },
    enabled: !!accountId,
  });

  const getMappingStatus = (productId: string, provider?: string) => {
    const lookup = query.data?.mappingLookup;
    if (!lookup) return { mapped: false, status: "unmapped" as const };
    const productMappings = lookup.get(productId);
    if (!productMappings) return { mapped: false, status: "unmapped" as const };
    if (provider) {
      const m = productMappings.get(provider);
      return m ? { mapped: true, status: "mapped" as const } : { mapped: false, status: "unmapped" as const };
    }
    return productMappings.size > 0
      ? { mapped: true, status: "mapped" as const }
      : { mapped: false, status: "unmapped" as const };
  };

  return {
    data: query.data?.matrix ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
    providerColumns: query.data?.providerColumns ?? [],
    getMappingStatus,
  };
}

export default useProductMappingMatrix;
