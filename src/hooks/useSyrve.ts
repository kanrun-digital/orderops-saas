"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

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
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const connectionsQuery = useQuery({
    queryKey: ["syrve-connections", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/syrve_connections?account_id=${accountId}&_sort=created_at&_order=desc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  const orgsQuery = useQuery({
    queryKey: ["syrve-organizations", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/syrve_organizations?account_id=${accountId}&_sort=name&_order=asc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  const connections = connectionsQuery.data ?? [];
  const organizations = orgsQuery.data ?? [];
  const isConnected = connections.length > 0;

  const sync = () => {
    apiPost(`/api/data/sync_jobs`, {
      account_id: accountId,
      job_type: "syrve_sync",
      status: "pending",
      provider: "syrve",
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["syrve-connections"] });
      queryClient.invalidateQueries({ queryKey: ["background-sync-jobs"] });
    });
  };

  return {
    data: connections,
    isLoading: connectionsQuery.isLoading || orgsQuery.isLoading,
    error: connectionsQuery.error ?? orgsQuery.error,
    isConnected,
    organizations,
    sync,
    refetch: () => {
      connectionsQuery.refetch();
      orgsQuery.refetch();
    },
  };
}

export default useSyrve;

export function useSelectedSyrveOrganization() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["syrve-selected-org", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/syrve_organizations?account_id=${accountId}&is_selected=1&_limit=1`
      ).then((r) => {
        const org = r.data?.[0];
        if (!org) return null;
        return {
          id: org.id,
          organization_id: org.organization_id ?? org.syrve_org_id,
          name: org.name,
          is_selected: true,
        } as SyrveOrganization;
      }),
    enabled: !!accountId,
  });

  const select = (orgId: string) => {
    // Deselect all, then select the target
    apiGet<{ data: any[] }>(
      `/api/data/syrve_organizations?account_id=${accountId}&is_selected=1`
    ).then(async (res) => {
      for (const org of res.data ?? []) {
        await apiPut(`/api/data/syrve_organizations/${org.pk_id}`, { is_selected: 0 });
      }
      const targetRes = await apiGet<{ data: any[] }>(
        `/api/data/syrve_organizations?account_id=${accountId}&id=${orgId}&_limit=1`
      );
      const target = targetRes.data?.[0];
      if (target) {
        await apiPut(`/api/data/syrve_organizations/${target.pk_id}`, { is_selected: 1 });
      }
      queryClient.invalidateQueries({ queryKey: ["syrve-selected-org"] });
      queryClient.invalidateQueries({ queryKey: ["syrve-organizations"] });
    });
  };

  return { data: query.data ?? null, isLoading: query.isLoading, select };
}

export function useSyrveTerminalGroups(orgId?: string | string[]) {
  const accountId = useAuthStore((s) => s.accountId);
  const orgIds = Array.isArray(orgId) ? orgId : orgId ? [orgId] : [];

  const query = useQuery({
    queryKey: ["syrve-terminal-groups", accountId, orgIds],
    queryFn: () => {
      const orgFilter = orgIds.length === 1
        ? `&organization_id=${orgIds[0]}`
        : orgIds.length > 1
          ? `&organization_id[in]=${orgIds.join(",")}`
          : "";
      return apiGet<{ data: any[] }>(
        `/api/data/syrve_terminal_groups?account_id=${accountId}${orgFilter}&_sort=name&_order=asc`
      ).then((r) => r.data);
    },
    enabled: !!accountId && orgIds.length > 0,
  });

  return { data: query.data ?? [], isLoading: query.isLoading };
}

type SyrveRefreshOrderResult = {
  order?: Record<string, unknown>;
};

export function useSyrveRefreshOrder() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      const d = data as any;
      const res = await apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "syrve_refresh_order",
        status: "pending",
        provider: "syrve",
        payload: JSON.stringify({ orderId: d.orderId ?? d.order_id }),
      });
      return { order: (res as any).data ?? {} } as SyrveRefreshOrderResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    mutate: mutation.mutate as any,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useLocationSyrveConfig(locationId?: string) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["location-syrve-config", accountId, locationId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/integration_settings?account_id=${accountId}&provider=syrve&_limit=10`
      ).then((r) => {
        // Find config matching location
        const settings = r.data ?? [];
        if (locationId) {
          const match = settings.find((s: any) => {
            const parsed = typeof s.settings === "string" ? JSON.parse(s.settings) : s.settings;
            return parsed?.location_id === locationId;
          });
          if (match) return match;
        }
        return settings[0] ?? null;
      }),
    enabled: !!accountId,
  });

  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error };
}

export function useSyrveOrganizations() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["syrve-organizations", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/syrve_organizations?account_id=${accountId}&_sort=name&_order=asc`
      ).then((r) =>
        (r.data ?? []).map((o: any) => ({
          id: o.id,
          organization_id: o.organization_id ?? o.syrve_org_id,
          name: o.name,
          is_selected: !!o.is_selected,
        } as SyrveOrganization))
      ),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSyrveCredentials() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["syrve-credentials", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/syrve_credentials?account_id=${accountId}&is_active=1&_limit=1`
      ).then((r) => r.data?.[0] ?? null),
    enabled: !!accountId,
  });

  return { data: query.data ?? null, isLoading: query.isLoading, error: query.error };
}

export function useSyrveCouriersMultiOrg(orgIds?: string[]) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["syrve-couriers", accountId, orgIds],
    queryFn: () =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "syrve_get_couriers",
        status: "pending",
        provider: "syrve",
        payload: JSON.stringify({ organizationIds: orgIds }),
      }).then((r) => (r as any).data ?? []),
    enabled: !!accountId && !!orgIds?.length,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSyrveCourierLocationsMultiOrg(orgIds?: string[]) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["syrve-courier-locations", accountId, orgIds],
    queryFn: () =>
      apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "syrve_get_courier_locations",
        status: "pending",
        provider: "syrve",
        payload: JSON.stringify({ organizationIds: orgIds }),
      }).then((r) => (r as any).data ?? []),
    enabled: !!accountId && !!orgIds?.length,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSyrveAddresses(level?: SyrveAddressLevel) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["syrve-addresses", accountId, level],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/syrve_addresses?account_id=${accountId}${level ? `&entity_type=${level}` : ""}&is_deleted=0&_sort=name&_order=asc&_limit=1000`
      ).then((r) =>
        (r.data ?? []).map((a: any) => ({
          id: a.id,
          syrve_id: a.syrve_id,
          name: a.name,
          parent_id: a.parent_id,
          entity_type: a.entity_type as SyrveAddressLevel,
          is_deleted: !!a.is_deleted,
        } as SyrveAddressRecord))
      ),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSyrveAddressCount(level?: SyrveAddressLevel) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["syrve-address-count", accountId, level],
    queryFn: () =>
      apiGet<{ data: any[]; total?: number }>(
        `/api/data/syrve_addresses?account_id=${accountId}${level ? `&entity_type=${level}` : ""}&is_deleted=0&_limit=1&includeTotal=true`
      ).then((r) => (r as any).total ?? r.data?.length ?? 0),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    dataUpdatedAt: query.dataUpdatedAt,
  };
}

type SyrveAddressLookupVariables = {
  cityName?: string;
  organizationId?: string;
};

type SyrveAddressLookupResult = {
  cities: SyrveAddressRecord[];
};

export function useSyrveAddressLookup(query?: string) {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (variables?: SyrveAddressLookupVariables) => {
      const searchTerm = variables?.cityName ?? query ?? "";
      const res = await apiGet<{ data: any[] }>(
        `/api/data/syrve_addresses?account_id=${accountId}&entity_type=city&name[like]=%${searchTerm}%&is_deleted=0&_limit=50`
      );
      return {
        cities: (res.data ?? []).map((a: any) => ({
          id: a.id,
          syrve_id: a.syrve_id,
          name: a.name,
          parent_id: a.parent_id,
          entity_type: a.entity_type as SyrveAddressLevel,
          is_deleted: !!a.is_deleted,
        } as SyrveAddressRecord)),
      } as SyrveAddressLookupResult;
    },
  });

  return {
    data: mutation.data ?? { cities: [] },
    mutate: mutation.mutate as any,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
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
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SyrveSyncAddressArg) => {
      const orgId = typeof data === "string" ? data : data.activeOrganizationId;
      await apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "syrve_sync_regions",
        status: "pending",
        provider: "syrve",
        payload: JSON.stringify({ organizationId: orgId }),
      });
      // Return count from addresses
      const res = await apiGet<{ data: any[]; total?: number }>(
        `/api/data/syrve_addresses?account_id=${accountId}&entity_type=region&is_deleted=0&_limit=1&includeTotal=true`
      );
      return { count: (res as any).total ?? 0 } as SyrveSyncAddressResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syrve-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["syrve-address-count"] });
    },
  });

  return {
    mutate: mutation.mutate as any,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useSyrveSyncCities(regionId?: string) {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: SyrveSyncAddressArg) => {
      const orgId = typeof data === "string" ? data : data.activeOrganizationId;
      await apiPost(`/api/data/sync_jobs`, {
        account_id: accountId,
        job_type: "syrve_sync_cities",
        status: "pending",
        provider: "syrve",
        payload: JSON.stringify({ organizationId: orgId, regionId }),
      });
      const res = await apiGet<{ data: any[]; total?: number }>(
        `/api/data/syrve_addresses?account_id=${accountId}&entity_type=city&is_deleted=0&_limit=1&includeTotal=true`
      );
      return { count: (res as any).total ?? 0 } as SyrveSyncAddressResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["syrve-addresses"] });
      queryClient.invalidateQueries({ queryKey: ["syrve-address-count"] });
    },
  });

  return {
    mutate: mutation.mutate as any,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}
