export function useSyrve() {
  return {
    data: [] as any,
    isLoading: false,
    error: null as Error | null,
    isConnected: false,
    organizations: [] as unknown[],
    sync: () => {},
    refetch: () => {},
  };
}
export default useSyrve;

export function useSelectedSyrveOrganization() {
  return { data: null as any, isLoading: false, select: (id: string) => {} };
}

export function useSyrveTerminalGroups(orgId?: string) {
  return { data: [] as any, isLoading: false };
}

export function useSyrveRefreshOrder() {
  return { mutate: (data: any) => {}, mutateAsync: async (data: any) => {}, isLoading: false, isPending: false };
}

export function useLocationSyrveConfig(locationId?: string) {
  return { data: null as any, isLoading: false, error: null as Error | null };
}
export function useSyrveOrganizations() {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
export function useSyrveCredentials() {
  return { data: null as any, isLoading: false, error: null as Error | null };
}

export function useSyrveCouriersMultiOrg(orgIds?: string[]) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
export function useSyrveCourierLocationsMultiOrg(orgIds?: string[]) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useSyrveAddresses(params?: any) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
export function useSyrveAddressCount() {
  return { data: 0 as any, isLoading: false, isFetching: false, dataUpdatedAt: 0 };
}
export function useSyrveAddressLookup(query?: string) {
  return { data: [] as any, isLoading: false };
}
export function useSyrveSyncRegions() {
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}
export function useSyrveSyncCities(regionId?: string) {
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}
