export function useAccountSubscription() {
  return {
    subscription: null as { plan: string; status: string; expiresAt: string } | null,
    isLoading: false,
    error: null as Error | null,
    isPro: false,
    isTrial: false,
    refetch: () => {},
  };
}
export default useAccountSubscription;
