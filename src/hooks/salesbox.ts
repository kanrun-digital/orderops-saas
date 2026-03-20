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
