export function useAccountSubscription() {
  return {
    subscription: null,
    isActive: true,
    isPro: false,
    isEnterprise: false,
    isLoading: false,
  };
}
export default useAccountSubscription;
