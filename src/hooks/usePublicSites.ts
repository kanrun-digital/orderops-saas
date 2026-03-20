export function usePublicSites(params?: any) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default usePublicSites;

export function useDiningTables(siteId?: string) {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
export function useCreatePublicSite() {
  return { mutate: (data: any) => {}, isLoading: false };
}
export function useUpdatePublicSite() {
  return { mutate: (data: any) => {}, isLoading: false };
}
export function useDeletePublicSite() {
  return { mutate: (id: string) => {}, isLoading: false };
}
export function useCreateDiningTable() {
  return { mutate: (data: any) => {}, isLoading: false };
}
export function useUpdateDiningTable() {
  return { mutate: (data: any) => {}, isLoading: false };
}
export function useDeleteDiningTable() {
  return { mutate: (id: string) => {}, isLoading: false };
}
