export type SyrveAddressLevel = 'region' | 'city' | 'street';

export interface SyrveAddressRecord {
  id: string;
  syrve_id: string;
  name: string;
  parent_id: string | null;
  entity_type: SyrveAddressLevel;
  is_deleted: boolean;
}

export interface SyrveOrganization {
  id: string;
  organization_id: string;
  name: string;
  is_selected: boolean;
}

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
  return { data: null as SyrveOrganization | null, isLoading: false, select: (_id: string) => {} };
}

export function useSyrveTerminalGroups(orgId?: string | string[]) {
  return { data: [] as any, isLoading: false };
}

type SyrveRefreshOrderResult = {
  order?: Record<string, unknown>;
};

export function useSyrveRefreshOrder() {
  return {
    mutate: (_data: unknown) => {},
    mutateAsync: async (_data: unknown): Promise<SyrveRefreshOrderResult> => ({ order: {} }),
    isLoading: false,
    isPending: false,
  };
}

export function useLocationSyrveConfig(locationId?: string) {
  void locationId;
  return { data: null as any, isLoading: false, error: null as Error | null };
}
export function useSyrveOrganizations() {
  return {
    data: [] as SyrveOrganization[],
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
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

export function useSyrveAddresses(level?: SyrveAddressLevel) {
  void level;
  return {
    data: [] as SyrveAddressRecord[],
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
}
export function useSyrveAddressCount(level?: SyrveAddressLevel) {
  void level;
  return { data: 0, isLoading: false, isFetching: false, dataUpdatedAt: 0 };
}
type SyrveAddressLookupVariables = {
  cityName?: string;
  organizationId?: string;
};

type SyrveAddressLookupResult = {
  cities: SyrveAddressRecord[];
};

export function useSyrveAddressLookup(query?: string) {
  void query;

  const result: SyrveAddressLookupResult = { cities: [] };

  return {
    data: result,
    mutate: (_variables?: SyrveAddressLookupVariables) => result,
    mutateAsync: async (_variables?: SyrveAddressLookupVariables): Promise<SyrveAddressLookupResult> => result,
    isLoading: false,
    isPending: false,
  };
}
type SyrveSyncAddressParams = {
  activeOrganizationId: string;
};

type SyrveSyncAddressResult = {
  count?: number;
};

type SyrveSyncAddressArg = string | SyrveSyncAddressParams;

export function useSyrveSyncRegions() {
  return {
    mutate: (_data: SyrveSyncAddressArg) => {},
    mutateAsync: async (_data: SyrveSyncAddressArg): Promise<SyrveSyncAddressResult> => ({ count: 0 }),
    isLoading: false,
    isPending: false,
  };
}
export function useSyrveSyncCities(regionId?: string) {
  void regionId;
  return {
    mutate: (_data: SyrveSyncAddressArg) => {},
    mutateAsync: async (_data: SyrveSyncAddressArg): Promise<SyrveSyncAddressResult> => ({ count: 0 }),
    isLoading: false,
    isPending: false,
  };
}
