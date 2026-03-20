export function useCustomerStats() {
  return {
    data: { total: 0, active: 0, new: 0, returning: 0, churned: 0 } as any,
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
}
export default useCustomerStats;
