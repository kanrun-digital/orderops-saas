export function useBolt() {
  return {
    data: null,
    isLoading: false,
    error: null as Error | null,
    isConnected: false,
    refetch: () => {},
  };
}
export default useBolt;

export function useBoltOrderAction() {
  return { mutate: (data: any) => {}, isLoading: false };
}
