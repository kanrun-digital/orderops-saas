export function useOrders(params?: any) {
  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useOrders;

export function useOrder(id?: string) {
  return { data: null as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}

export function useUpdateOrder() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}

export function useDeleteOrder() {
  return { mutate: (data: any) => {}, mutateAsync: async (data: any) => {}, isLoading: false, isPending: false };
}

export function useAssignOrder() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}

export function useOrderOperators() {
  return { data: [] as any, isLoading: false, error: null as Error | null };
}

export function useOrderAssignmentHistory(orderId?: string) {
  return { data: [] as any, isLoading: false };
}

export function useOrderAssignmentPermissions() {
  return { canAssign: false, canReassign: false, canUnassign: false };
}
