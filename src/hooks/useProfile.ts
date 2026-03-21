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
  return {
    data: null,
    user: null,
    isLoading: false,
    error: null,
    isAdmin: false,
    updateProfile: (_data: Record<string, unknown>) => {},
    refetch: () => {},
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
  return {
    mutate: (_data: unknown) => {},
    mutateAsync: async (_data: unknown) => {},
    isLoading: false,
    isPending: false,
    error: null,
  };
}
