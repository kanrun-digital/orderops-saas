export function useMenu(params?: any) {
  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useMenu;

export function useAllMenuProducts(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useMenuCategories(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useMenuProducts(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useModifierGroups(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useStopListProducts(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
