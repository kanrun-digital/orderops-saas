export function useMenu(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useMenu;

export function useAllMenuProducts(params?: Record<string, unknown>) {
  return { data: [] as unknown[], isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useMenuCategories(params?: Record<string, unknown>) {
  return { data: [] as unknown[], isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useMenuProducts(params?: Record<string, unknown>) {
  return { data: [] as unknown[], isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useModifierGroups(params?: Record<string, unknown>) {
  return { data: [] as unknown[], isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useStopListProducts(params?: Record<string, unknown>) {
  return { data: [] as unknown[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
