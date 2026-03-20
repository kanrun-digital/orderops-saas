export function useProfile() {
  return {
    user: null as { id: string; email: string; name: string; role: string; avatarUrl?: string } | null,
    isLoading: false,
    error: null as Error | null,
    isAdmin: false,
    updateProfile: (data: Record<string, unknown>) => {},
    refetch: () => {},
  };
}
export default useProfile;
