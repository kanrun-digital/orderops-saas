export function useSalesboxOrders() {
  return { data: [], isLoading: false, error: null, refetch: () => {} };
}
export function useSalesboxCustomers() {
  return { data: [], isLoading: false, error: null, refetch: () => {} };
}
export function useSalesboxChatsData() {
  return { data: [], isLoading: false, error: null, refetch: () => {} };
}
export default { useSalesboxOrders, useSalesboxCustomers, useSalesboxChatsData };

export function useSalesboxClearCustomers() {
  return { mutate: () => {}, mutateAsync: () => {}, isLoading: false, isPending: false };
}

export function useSalesboxUpdateOrderStatus() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
