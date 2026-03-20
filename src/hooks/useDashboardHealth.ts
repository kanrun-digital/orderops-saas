export function useDashboardHealth() {
  return {
    data: { status: "ok" as string, integrations: [] as unknown[], alerts: [] as unknown[] },
    isLoading: false,
    error: null as Error | null,
    refetch: () => {},
  };
}
export default useDashboardHealth;
