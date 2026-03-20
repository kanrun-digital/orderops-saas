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

export function useUpdateAccountSettings() {
  return { mutate: (data: any) => {}, mutateAsync: async (data: any) => {}, isLoading: false, isPending: false, error: null as Error | null };
}

export default useAccountSettings;
