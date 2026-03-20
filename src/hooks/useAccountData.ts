export function useAccountData(params?: Record<string, unknown>) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useAccountData;

export function useCreateRestaurant() {
  return { mutate: (data: any) => {}, isLoading: false };
}

export function useUpdateRestaurant() {
  return { mutate: (data: any) => {}, isLoading: false };
}

export function useUpdateLocation() {
  return { mutate: (data: any) => {}, isLoading: false };
}
