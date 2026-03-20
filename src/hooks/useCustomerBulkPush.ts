export function useCustomerBulkPush() {
  return {
    mutate: (..._args: unknown[]) => {},
    mutateAsync: async (..._args: unknown[]) => {},
    isLoading: false,
    isPending: false,
    isError: false,
    error: null as Error | null,
    reset: () => {},
  };
}

export default useCustomerBulkPush;
