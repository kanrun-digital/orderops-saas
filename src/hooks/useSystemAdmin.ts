"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useSystemAdmin() {
  const accountId = useAuthStore((s) => s.accountId);
  const session = useAuthStore((s) => s.session);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const adminQuery = useQuery({
    queryKey: ["system-admin", session?.user_id],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/user_roles?user_id=${session?.user_id}&role=system_admin&_limit=1`
      ).then((r) => (r.data?.length ?? 0) > 0),
    enabled: !!session?.user_id,
  });

  const isSystemAdmin = adminQuery.data === true;

  const accountsQuery = useQuery({
    queryKey: ["system-admin-accounts"],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_analytics_summary?_sort=account_created_at&_order=desc&_limit=200`
      ).then((r) => r.data),
    enabled: isSystemAdmin,
  });

  const usersQuery = useQuery({
    queryKey: ["system-admin-users"],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/profiles_directory?_sort=created_at&_order=desc&_limit=500`
      ).then((r) => r.data),
    enabled: isSystemAdmin,
  });

  return {
    accounts: accountsQuery.data ?? [],
    users: usersQuery.data ?? [],
    isLoading: adminQuery.isLoading || accountsQuery.isLoading || usersQuery.isLoading,
    error: adminQuery.error ?? accountsQuery.error ?? usersQuery.error,
    isAdmin: isSystemAdmin,
    data: isSystemAdmin,
    refetch: () => {
      adminQuery.refetch();
      accountsQuery.refetch();
      usersQuery.refetch();
    },
  };
}

export default useSystemAdmin;
export const useIsSystemAdmin = useSystemAdmin;
