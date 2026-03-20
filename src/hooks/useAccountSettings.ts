export function useAccountSettings() {
  return {
    data: {} as any,
    settings: {} as any,
    isLoading: false,
    error: null as Error | null,
    updateSetting: (key: string, value: unknown) => {},
    refetch: () => {},
  };
}
export default useAccountSettings;

export function useUpdateAccountSettings() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false, error: null as Error | null };
}
