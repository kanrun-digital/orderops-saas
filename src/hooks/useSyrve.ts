export function useSyrve() {
  return {
    data: [] as unknown[],
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
  return { data: [] as any[], isLoading: false };
}

export function useSyrveRefreshOrder() {
  return { mutate: (orderId: string) => {}, isLoading: false };
}

export function useLocationSyrveConfig(locationId?: string) {
  return { data: null as any, isLoading: false, error: null as Error | null };
}
