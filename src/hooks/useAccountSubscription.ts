"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useAccountSubscription(accountIdOverride?: string | null) {
  const storeAccountId = useAuthStore((s) => s.accountId);
  const accountId = accountIdOverride ?? storeAccountId;

  const query = useQuery({
    queryKey: ["account-subscription", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_subscriptions?account_id=${accountId}&_sort=created_at&_order=desc&_limit=1`
      ).then((r) => r.data?.[0] ?? null),
    enabled: !!accountId,
  });

  const sub = query.data;
  const isPro = sub?.plan !== "free" && sub?.status === "active";
  const isTrial = !!sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();

  return {
    data: sub ?? {
      plan: "free",
      status: "active",
      expiresAt: "",
      provider: "manual",
      provider_customer_id: null,
      provider_subscription_id: null,
      trial_ends_at: null,
      canceled_at: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
      metadata: {},
    },
    isLoading: query.isLoading,
    error: query.error,
    isPro,
    isTrial,
    refetch: query.refetch,
  };
}

export default useAccountSubscription;
