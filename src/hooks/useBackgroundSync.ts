export function useBackgroundSync() {
  return {
    isSyncing: false,
    lastSync: null as string | null,
    triggerSync: (type?: string) => {},
    cancelSync: () => {},
    progress: 0,
  };
}
export default useBackgroundSync;
