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
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
export function useUpdatePublicSite() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
export function useDeletePublicSite() {
  return { mutate: (id: string) => {}, mutateAsync: (id: string) => {}, isLoading: false, isPending: false };
}
export function useCreateDiningTable() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
export function useUpdateDiningTable() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
export function useDeleteDiningTable() {
  return { mutate: (id: string) => {}, mutateAsync: (id: string) => {}, isLoading: false, isPending: false };
}
