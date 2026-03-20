import { create } from "zustand";

interface AuthState {
  user: { id: string; email: string; name: string; role: string } | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string) => void;
  logout: () => void;
  setUser: (user: AuthState["user"]) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  login: (token: string) => set({ token, isAuthenticated: true }),
  logout: () => set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),
  setUser: (user) => set({ user, isAdmin: user?.role === "admin" }),
}));

export default useAuthStore;
