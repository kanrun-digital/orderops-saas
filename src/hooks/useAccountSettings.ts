"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseJsonSettings, serializeJsonSettings, type JsonSettingsValue } from "@/lib/utils/settings";
import { apiGet, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

type AccountRecord = {
  pk_id?: number;
  id?: string;
  settings?: string | JsonSettingsValue | null;
  [key: string]: unknown;
};

async function fetchAccount(accountId: string) {
  const response = await apiGet<{ data: AccountRecord[] }>(`/api/data/accounts?id=${accountId}`);
  const account = response.data?.[0] ?? null;

  if (!account) {
    throw new Error("Account not found");
  }

  return account;
}

export function useAccountSettings() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["account-settings", accountId],
    queryFn: () => fetchAccount(accountId as string),
    enabled: !!accountId,
    select: (account) => ({
      account,
      settings: parseJsonSettings(account.settings),
    }),
  });

  return {
    account: query.data?.account ?? null,
    settings: query.data?.settings ?? {},
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useUpdateAccountSettings() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (settingsPatch: JsonSettingsValue) => {
      if (!accountId) {
        throw new Error("Account not found");
      }

      const account = await fetchAccount(accountId);
      const currentSettings = parseJsonSettings(account.settings);
      const nextSettings = {
        ...currentSettings,
        ...settingsPatch,
      };

      return apiPut(`/api/data/accounts/${account.pk_id}`, {
        settings: serializeJsonSettings(nextSettings),
      });
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
