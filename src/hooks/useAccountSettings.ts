"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useAccountSettings() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["account-settings", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(`/api/data/accounts?id=${accountId}`).then(
        (r) => r.data?.[0] ?? {}
      ),
    enabled: !!accountId,
  });

  const account = query.data ?? {};
  const settings = typeof account.settings === "string"
    ? JSON.parse(account.settings || "{}")
    : account.settings ?? {};

  const updateSetting = (key: string, value: unknown) => {
    const newSettings = { ...settings, [key]: value };
    if (account.pk_id) {
      apiPut(`/api/data/accounts/${account.pk_id}`, {
        settings: JSON.stringify(newSettings),
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["account-settings"] });
      });
    }
  };

  return {
    data: account,
    settings,
    isLoading: query.isLoading,
    error: query.error,
    updateSetting,
    refetch: query.refetch,
  };
}

export function useUpdateAccountSettings() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const accountRes = await apiGet<{ data: any[] }>(`/api/data/accounts?id=${accountId}`);
      const account = accountRes.data?.[0];
      if (!account) throw new Error("Account not found");
      return apiPut(`/api/data/accounts/${account.pk_id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-settings"] });
      queryClient.invalidateQueries({ queryKey: ["account-data"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export default useAccountSettings;
