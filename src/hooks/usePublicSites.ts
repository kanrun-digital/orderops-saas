"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function usePublicSites(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["public-sites", accountId, params],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/public_sites?account_id=${accountId}&_sort=created_at&_order=desc`
      ).then((r) => r.data),
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

export default usePublicSites;

export function useDiningTables(siteId?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["dining-tables", accountId, siteId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/dining_tables?account_id=${accountId}&site_id=${siteId}&_sort=table_name&_order=asc`
      ).then((r) => r.data),
    enabled: !!accountId && !!siteId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreatePublicSite() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPost(`/api/data/public_sites`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-sites"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useUpdatePublicSite() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/public_sites/${data.pk_id}`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-sites"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useDeletePublicSite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiDelete(`/api/data/public_sites/${data.pk_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-sites"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useCreateDiningTable() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPost(`/api/data/dining_tables`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dining-tables"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useUpdateDiningTable() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/dining_tables/${data.pk_id}`, { ...data, account_id: accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dining-tables"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useDeleteDiningTable() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) => apiDelete(`/api/data/dining_tables/${data.pk_id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dining-tables"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}
