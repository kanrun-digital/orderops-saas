"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import * as authService from "@/services/auth";
import { apiPost } from "@/services/api-client";
import { API_ROUTES, ROUTES } from "@/constants/routes";
import type { NcbSession, ProvisionResponse } from "@/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useAuthStore();

  // ── Session query ────────────────────────────
  const sessionQuery = useQuery<NcbSession | null>({
    queryKey: ["session"],
    queryFn: authService.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Sync session to store
  useEffect(() => {
    if (sessionQuery.isSuccess) {
      store.setSession(sessionQuery.data);
      store.setLoading(false);
    }
    if (sessionQuery.isError) {
      store.reset();
    }
  }, [sessionQuery.data, sessionQuery.isSuccess, sessionQuery.isError]);

  // ── Auto-provision on first login ────────────
  const provisionMutation = useMutation<ProvisionResponse>({
    mutationFn: () => apiPost(API_ROUTES.provision),
    onSuccess: (data) => {
      store.setAccount(data.account);
      store.setProfile(data.profile);
    },
  });

  useEffect(() => {
    if (sessionQuery.data && !store.account) {
      provisionMutation.mutate();
    }
  }, [sessionQuery.data]);

  // ── Sign in ──────────────────────────────────
  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push(ROUTES.dashboard);
    },
  });

  // ── Sign out ─────────────────────────────────
  const signOutMutation = useMutation({
    mutationFn: authService.signOut,
    onSuccess: () => {
      store.reset();
      queryClient.clear();
      router.push(ROUTES.login);
    },
  });

  return {
    session: store.session,
    account: store.account,
    profile: store.profile,
    isAdmin: store.isAdmin,
    isLoading: store.isLoading || sessionQuery.isLoading,
    isAuthenticated: !!store.session,

    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    signInLoading: signInMutation.isPending,
    signInError: signInMutation.error,
  };
}
