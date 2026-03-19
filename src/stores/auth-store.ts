import { create } from "zustand";
import type { NcbSession, Account, Profile } from "@/types";

interface AuthState {
  session: NcbSession | null;
  account: Account | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;

  setSession: (session: NcbSession | null) => void;
  setAccount: (account: Account | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  account: null,
  profile: null,
  isAdmin: false,
  isLoading: true,

  setSession: (session) =>
    set({ session }),

  setAccount: (account) =>
    set({ account }),

  setProfile: (profile) =>
    set({ profile }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  reset: () =>
    set({
      session: null,
      account: null,
      profile: null,
      isAdmin: false,
      isLoading: false,
    }),
}));
