export function useSystemAdmin() {
  return {
    accounts: [] as unknown[],
    users: [] as unknown[],
    isLoading: false,
    error: null as Error | null,
    isAdmin: false,
    refetch: () => {},
  };
}
export default useSystemAdmin;
