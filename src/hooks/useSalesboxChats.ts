export function useSalesboxChatMessages(chatId?: string | null) {
  return { data: [] as any[], isLoading: false, error: null as Error | null, refetch: () => {} };
}
export function useSalesboxMarkChatRead() {
  return { mutate: (chatId: string) => {}, isLoading: false };
}
export function useSalesboxSendMessage() {
  return { mutate: (data: any) => {}, isLoading: false };
}
export function useSalesboxChats(params?: any) {

  return {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: () => {},
    isFetching: false,
  };
}

export default useSalesboxChats;
