"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
}

interface UseProfileResult {
  data: ProfileData | null;
  user: ProfileData | null;
  isLoading: boolean;
  error: Error | null;
  isAdmin: boolean;
  updateProfile: (data: Record<string, unknown>) => void;
  refetch: () => void;
}

export function useProfile(): UseProfileResult {
  const session = useAuthStore((s) => s.session);
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["profile", session?.id],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/profiles?id=${session?.id}&_limit=1`
      ).then((r) => {
        const p = r.data?.[0];
        if (!p) return null;
        return {
          id: p.id,
          email: p.email ?? session?.email ?? "",
          full_name: p.full_name ?? "",
          role: session?.role ?? "staff",
          avatar_url: p.avatar_url,
        } as ProfileData;
      }),
    enabled: !!session?.id,
  });

  const profile = query.data ?? null;

  const updateProfile = (data: Record<string, unknown>) => {
    if (profile) {
      apiGet<{ data: any[] }>(`/api/data/profiles?id=${profile.id}&_limit=1`).then((r) => {
        const existing = r.data?.[0];
        if (existing?.pk_id) {
          apiPut(`/api/data/profiles/${existing.pk_id}`, data).then(() => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
          });
        }
      });
    }
  };

  return {
    data: profile,
    user: profile,
    isLoading: query.isLoading,
    error: query.error,
    isAdmin,
    updateProfile,
    refetch: query.refetch,
  };
}

export default useProfile;

interface UseUpdateProfileResult {
  mutate: (data: unknown) => void;
  mutateAsync: (data: unknown) => Promise<void>;
  isLoading: boolean;
  isPending: boolean;
  error: Error | null;
}

export function useUpdateProfile(): UseUpdateProfileResult {
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: unknown) => {
      const profileRes = await apiGet<{ data: any[] }>(
        `/api/data/profiles?id=${session?.id}&_limit=1`
      );
      const existing = profileRes.data?.[0];
      if (!existing?.pk_id) throw new Error("Profile not found");
      await apiPut(`/api/data/profiles/${existing.pk_id}`, data as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync as any,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
