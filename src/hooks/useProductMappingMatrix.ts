export function useProductMappingMatrix(params?: any) {
  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
    providerColumns: [] as string[],
    getMappingStatus: (id: string) => "unmapped" as string,
  };
}

export default useProductMappingMatrix;
