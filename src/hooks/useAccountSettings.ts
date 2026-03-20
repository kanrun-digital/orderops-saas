export function useAccountSettings() {
  return {
    settings: {} as Record<string, unknown>,
    isLoading: false,
    error: null as Error | null,
    updateSetting: (key: string, value: unknown) => {},
    refetch: () => {},
  };
}
export default useAccountSettings;
