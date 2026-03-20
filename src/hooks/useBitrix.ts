export function useBitrix() {
  return {
    data: [] as unknown[],
    isLoading: false,
    error: null as Error | null,
    isConnected: false,
    sync: () => {},
    disconnect: () => {},
    refetch: () => {},
  };
}
export default useBitrix;
