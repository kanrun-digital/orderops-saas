"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { API_ROUTES, ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth-store";
import { apiPost } from "@/services/api-client";
import * as authService from "@/services/auth";
import type { NcbSession, ProvisionResponse } from "@/types";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const store = useAuthStore();

  const sessionQuery = useQuery<NcbSession | null>({
    queryKey: ["session"],
    queryFn: authService.getSession,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (sessionQuery.isSuccess) {
      store.setSession(sessionQuery.data);
      store.setLoading(false);
    }

    if (sessionQuery.isError) {
      store.reset();
    }
  }, [sessionQuery.data, sessionQuery.isError, sessionQuery.isSuccess, store]);

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
  }, [provisionMutation, sessionQuery.data, store.account]);

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push(ROUTES.dashboard);
    },
  });

  const sendOtpMutation = useMutation({
    mutationFn: ({ email }: { email: string }) => authService.sendEmailOtp(email),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authService.verifyEmailOtp(email, otp),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push(ROUTES.dashboard);
    },
  });

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
    accountId: store.accountId,
    userRole: store.userRole,
    displayName: store.displayName,
    isLoading: store.isLoading || sessionQuery.isLoading,
    isAuthenticated: !!store.session,

    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    sendOtp: sendOtpMutation.mutateAsync,
    verifyOtp: verifyOtpMutation.mutateAsync,

    signInLoading: signInMutation.isPending,
    otpLoading: sendOtpMutation.isPending || verifyOtpMutation.isPending,

    signInError: signInMutation.error,
    otpError: sendOtpMutation.error || verifyOtpMutation.error,
  };
}
