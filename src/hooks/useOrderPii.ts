export function useOrderPii(orderId: string) {
  return {
    phone: null as string | null,
    email: null as string | null,
    address: null as string | null,
    isLoading: false,
    isRevealed: false,
    reveal: () => {},
  };
}
export default useOrderPii;
