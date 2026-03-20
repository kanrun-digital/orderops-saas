export function useMenuSyncProviders(params?: any) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
    providers: [] as any[],
    exportProviders: [] as any[],
    catalogProviders: [] as any[],
    posProvider: null as any,
  };
}

export default useMenuSyncProviders;
