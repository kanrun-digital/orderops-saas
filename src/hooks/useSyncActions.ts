export function useSyncActions() {
  return {
    triggerSync: (type: string) => {},
    cancelSync: (id: string) => {},
    retrySync: (id: string) => {},
    isLoading: false,
  };
}
export default useSyncActions;
