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
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}
export function useStartBackgroundBitrixSync() {
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}
export function useStartBackgroundBitrixAutoMatch() {
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}
export function useCancelBackgroundSync(jobType?: string) {
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}
export default useBackgroundSync;

export function useActiveBackgroundSyncJobs() {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
