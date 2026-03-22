"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useMenu(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["menu", accountId, params],
    queryFn: async () => {
      const [productsRes, categoriesRes] = await Promise.all([
        apiGet<{ data: any[] }>(
          `/api/data/menu_products?account_id=${accountId}&_sort=sort_order&_order=asc&_limit=500`
        ),
        apiGet<{ data: any[] }>(
          `/api/data/menu_categories?account_id=${accountId}&_sort=sort_order&_order=asc&_limit=200`
        ),
      ]);
      return {
        products: productsRes.data ?? [],
        categories: categoriesRes.data ?? [],
      };
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? { products: [], categories: [] },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useMenu;

export function useAllMenuProducts(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["all-menu-products", accountId, params],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/menu_products?account_id=${accountId}&_sort=sort_order&_order=asc&_limit=1000`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMenuCategories(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["menu-categories", accountId, params],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/menu_categories?account_id=${accountId}&_sort=sort_order&_order=asc&_limit=200`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useMenuProducts(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["menu-products", accountId, params],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", "sort_order");
      sp.set("_order", "asc");
      sp.set("_limit", "500");
      if (params?.categoryId) sp.set("category_id", params.categoryId);
      if (params?.isActive !== undefined) sp.set("is_active", params.isActive ? "1" : "0");

      return apiGet<{ data: any[] }>(
        `/api/data/menu_products?${sp.toString()}`
      ).then((r) => r.data);
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useModifierGroups(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["modifier-groups", accountId, params],
    queryFn: () => {
      const sp = new URLSearchParams();
      sp.set("account_id", accountId!);
      sp.set("_sort", "created_at");
      sp.set("_order", "desc");
      sp.set("_limit", "200");
      if (params?.productId) sp.set("product_id", params.productId);

      return apiGet<{ data: any[] }>(
        `/api/data/modifier_groups?${sp.toString()}`
      ).then((r) => r.data);
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useStopListProducts(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["stop-list-products", accountId, params],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/menu_products?account_id=${accountId}&is_in_stop_list=1&_sort=name&_order=asc&_limit=500`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
