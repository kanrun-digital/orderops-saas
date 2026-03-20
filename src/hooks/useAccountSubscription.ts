export function useAccountSubscription(accountId?: string | null) {
  const subscription = {
    plan: "free",
    status: "active",
    expiresAt: "",
    provider: "manual",
  };
  return {
    data: subscription,
    isLoading: false,
    error: null as Error | null,
    isPro: false,
    isTrial: false,
    refetch: () => {},
  };
}
export default useAccountSubscription;
