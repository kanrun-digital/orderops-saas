export function useProductMappingMatrix(params?: any) {
  void params;

  return {
    data: [] as any[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
    providerColumns: [] as any[],
    getMappingStatus: (_id: string, _provider?: string) => ({
      mapped: false,
      status: "unmapped" as const,
    }),
  };
}

export default useProductMappingMatrix;
