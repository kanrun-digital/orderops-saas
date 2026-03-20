export function useCustomerDataOps() {
  return {
    merge: (..._args: unknown[]) => {},
    deduplicate: () => {},
    cleanUp: () => {},
    isLoading: false,
    error: null as Error | null,
  };
}
export function useProviderConnections(provider?: string) {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
export default useCustomerDataOps;
