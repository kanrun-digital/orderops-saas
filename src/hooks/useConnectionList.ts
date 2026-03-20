export function useConnectionList(params?: any) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useConnectionList;

export function useProviderConnections(provider?: string) {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}

export interface ConnectionListItem {
  id: string;
  provider_code: string;
  name: string;
  status: string;
  created_at?: string;
}
