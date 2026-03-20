export function useConnectionList(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useConnectionList;

export function useProviderConnections(provider?: string) {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
