export function useCustomerDataOps() {
  return {
    merge: (..._args: unknown[]) => {},
    deduplicate: () => {},
    cleanUp: () => {},
    isLoading: false,
    error: null as Error | null,
  };
}
export default useCustomerDataOps;
