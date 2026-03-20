export function useSalesboxChatMessages(chatId?: string | null) {
  return { data: [] as any, isLoading: false, error: null as Error | null, refetch: () => {} };
}
export function useSalesboxMarkChatRead() {
  return { mutate: (data: any) => {}, mutateAsync: async (data: any) => {}, isLoading: false, isPending: false };
}
export function useSalesboxSendMessage() {
  return { mutate: (data: any) => {}, mutateAsync: (data: any) => {}, isLoading: false, isPending: false };
}
export function useSalesboxChats(params?: any) {

  return {
    data: [] as any,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useSalesboxChats;
