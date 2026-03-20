export function useAccountSubscription(accountId?: string | null) {
  const subscription = {
    plan: "free",
    status: "active",
    expiresAt: "",
    provider: "manual",
    provider_customer_id: null as string | null,
    provider_subscription_id: null as string | null,
    trial_ends_at: null as string | null,
    canceled_at: null as string | null,
    current_period_start: null as string | null,
    current_period_end: null as string | null,
    cancel_at_period_end: false,
    metadata: {} as any,
    [key: string]: any,
  };
  return {
    data: subscription as any,
    isLoading: false,
    error: null as Error | null,
    isPro: false,
    isTrial: false,
    refetch: () => {},
  };
}
export default useAccountSubscription;
