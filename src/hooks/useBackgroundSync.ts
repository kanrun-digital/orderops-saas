export function useBackgroundSync() {
  return {
    isSyncing: false,
    lastSync: null as string | null,
    triggerSync: (type?: string) => {},
    cancelSync: () => {},
    progress: 0,
    activeJobs: [] as any[],
  };
}
export function useStartBackgroundCustomerSync() {
  return { mutate: () => {}, isLoading: false };
}
export function useStartBackgroundBitrixSync() {
  return { mutate: () => {}, isLoading: false };
}
export function useStartBackgroundBitrixAutoMatch() {
  return { mutate: () => {}, isLoading: false };
}
export function useCancelBackgroundSync(jobType?: string) {
  return { mutate: () => {}, isLoading: false };
}
export default useBackgroundSync;

export function useActiveBackgroundSyncJobs() {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
