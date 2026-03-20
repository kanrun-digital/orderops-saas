export function useTeamManagement() {
  return {
    members: [] as unknown[],
    invites: [] as unknown[],
    isLoading: false,
    error: null as Error | null,
    invite: (email: string, role: string) => {},
    removeMember: (id: string) => {},
    updateRole: (id: string, role: string) => {},
    refetch: () => {},
  };
}
export default useTeamManagement;
