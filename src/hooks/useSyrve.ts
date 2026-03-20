export function useSyrve() {
  return {
    data: [] as unknown[],
    isLoading: false,
    error: null as Error | null,
    isConnected: false,
    organizations: [] as unknown[],
    sync: () => {},
    refetch: () => {},
  };
}
export default useSyrve;
