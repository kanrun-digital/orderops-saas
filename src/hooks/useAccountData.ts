"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useAccountData(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["account-data", accountId, params],
    queryFn: async () => {
      const [accountRes, restaurantsRes, locationsRes] = await Promise.all([
        apiGet<{ data: any[] }>(`/api/data/accounts?id=${accountId}`),
        apiGet<{ data: any[] }>(`/api/data/restaurants?account_id=${accountId}&_sort=created_at&_order=desc`),
        apiGet<{ data: any[] }>(`/api/data/restaurant_locations?account_id=${accountId}&_sort=created_at&_order=desc`),
      ]);
      return {
        account: accountRes.data?.[0] ?? null,
        restaurants: restaurantsRes.data ?? [],
        locations: locationsRes.data ?? [],
      };
    },
    enabled: !!accountId,
  });

  return {
    data: query.data ?? { account: null, restaurants: [], locations: [] },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useAccountData;

export function useCreateRestaurant() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPost(`/api/data/restaurants`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-data"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useUpdateRestaurant() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/restaurants/${data.pk_id}`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-data"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useUpdateLocation() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/restaurant_locations/${data.pk_id}`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-data"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}
