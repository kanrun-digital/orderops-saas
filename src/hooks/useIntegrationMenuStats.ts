export function useIntegrationMenuStats() {
  return {
    data: { totalProducts: 0, mappedProducts: 0, unmappedProducts: 0, categories: 0 },
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
}
export default useIntegrationMenuStats;
