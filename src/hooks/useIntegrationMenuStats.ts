export function useIntegrationMenuStats(_provider?: string, _enabled?: boolean) {
  return {
    data: { totalProducts: 0, mappedProducts: 0, unmappedProducts: 0, categories: 0 } as any,
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
}
export default useIntegrationMenuStats;
