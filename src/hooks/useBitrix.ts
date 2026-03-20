export function useBitrix() {
  return {
    data: [] as any,
    isLoading: false,
    error: null as Error | null,
    isConnected: false,
    sync: () => {},
    disconnect: () => {},
    refetch: () => {},
  };
}
export default useBitrix;

export function useBitrixUpdateOrderStatus() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
