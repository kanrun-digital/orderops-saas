export function useCustomerIngestionStats() {
  return {
    data: { total: 0, ingested: 0, matched: 0, unmatched: 0, duplicates: 0 } as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
  };
}
export default useCustomerIngestionStats;
