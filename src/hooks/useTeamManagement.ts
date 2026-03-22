"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useTeamManagement() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ["team-members", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_users?account_id=${accountId}&is_active=1&_sort=created_at&_order=asc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  const invitesQuery = useQuery({
    queryKey: ["team-invites", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_invites?account_id=${accountId}&accepted_at=&_sort=created_at&_order=desc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  const invite = (email: string, role: string) => {
    apiPost(`/api/data/account_invites`, {
      account_id: accountId,
      email,
      role,
    }).then(() => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    });
  };

  const removeMember = (id: string) => {
    apiGet<{ data: any[] }>(
      `/api/data/account_users?account_id=${accountId}&id=${id}&_limit=1`
    ).then((r) => {
      const user = r.data?.[0];
      if (user?.pk_id) {
        apiPut(`/api/data/account_users/${user.pk_id}`, { is_active: 0 }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["team-members"] });
        });
      }
    });
  };

  const updateRole = (id: string, role: string) => {
    apiGet<{ data: any[] }>(
      `/api/data/account_users?account_id=${accountId}&id=${id}&_limit=1`
    ).then((r) => {
      const user = r.data?.[0];
      if (user?.pk_id) {
        apiPut(`/api/data/account_users/${user.pk_id}`, { role }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["team-members"] });
        });
      }
    });
  };

  return {
    members: membersQuery.data ?? [],
    invites: invitesQuery.data ?? [],
    isLoading: membersQuery.isLoading || invitesQuery.isLoading,
    error: membersQuery.error ?? invitesQuery.error,
    invite,
    removeMember,
    updateRole,
    refetch: () => {
      membersQuery.refetch();
      invitesQuery.refetch();
    },
  };
}

export default useTeamManagement;

export function useTeamMembers() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["team-members", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_users?account_id=${accountId}&is_active=1&_sort=created_at&_order=asc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInviteTeamMember() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPost(`/api/data/account_invites`, {
        account_id: accountId,
        email: data.email,
        role: data.role ?? "staff",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function usePendingInvites() {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["team-invites", accountId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/account_invites?account_id=${accountId}&accepted_at=&_sort=created_at&_order=desc`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Re-create the invite to "resend" it
      const inviteId = data.pk_id ?? data.id;
      return apiPut(`/api/data/account_invites/${inviteId}`, {
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useCancelInvite() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiDelete(`/api/data/account_invites/${data.pk_id ?? data.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-invites"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useRemoveMember() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const userId = data.pk_id ?? data.id;
      return apiPut(`/api/data/account_users/${userId}`, { is_active: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPut(`/api/data/account_users/${data.pk_id ?? data.id}`, { role: data.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useTransferOwnership() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      // Set target user as owner, demote current owner
      const targetId = data.pk_id ?? data.id;
      await apiPut(`/api/data/account_users/${targetId}`, { role: "owner" });
      // The backend should handle demoting the current owner
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}
