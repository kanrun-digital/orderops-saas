export function useAccountSubscription(accountId?: string | null) {
  return {
    data: {
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
    } as any,
    isLoading: false,
    error: null as Error | null,
    isPro: false,
    isTrial: false,
    refetch: () => {},
  };
}
export default useAccountSubscription;
