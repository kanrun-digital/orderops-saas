import { create } from "zustand";
import type { Account, AccountRole, NcbSession, Profile } from "@/types";

export interface AuthState {
  session: NcbSession | null;
  account: Account | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  accountId: string | null;
  userRole: AccountRole | null;
  displayName: string | null;

  setSession: (session: NcbSession | null) => void;
  setAccount: (account: Account | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const deriveState = (
  session: NcbSession | null,
  account: Account | null,
  profile: Profile | null,
) => {
  const accountId = account?.id ?? session?.account_id ?? null;
  const userRole = session?.role ?? null;
  const displayName = profile?.display_name ?? profile?.full_name ?? session?.email ?? null;

  return {
    accountId,
    userRole,
    displayName,
    isAdmin: userRole === "owner" || userRole === "admin",
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  account: null,
  profile: null,
  isAdmin: false,
  isLoading: true,
  accountId: null,
  userRole: null,
  displayName: null,

  setSession: (session) =>
    set((state) => ({
      session,
      ...deriveState(session, state.account, state.profile),
    })),

  setAccount: (account) =>
    set((state) => ({
      account,
      ...deriveState(state.session, account, state.profile),
    })),

  setProfile: (profile) =>
    set((state) => ({
      profile,
      ...deriveState(state.session, state.account, profile),
    })),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      session: null,
      account: null,
      profile: null,
      isAdmin: false,
      isLoading: false,
      accountId: null,
      userRole: null,
      displayName: null,
    }),
}));
