export function useOrderAssignments(params?: any) {
  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export function useAssignOrder() {
  return { mutate: (data: any) => {}, isLoading: false };
}
export function useOrderOperators() {
  return { data: [] as any[], isLoading: false, error: null as Error | null };
}
export function useOrderAssignmentHistory(orderId?: string) {
  return { data: [] as any[], isLoading: false };
}
export function useOrderAssignmentPermissions() {
  return { canAssign: false, canReassign: false, canUnassign: false };
}
export default useOrderAssignments;
