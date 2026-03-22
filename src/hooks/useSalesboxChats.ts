"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/services/api-client";
import { useAuthStore } from "@/stores/auth-store";

export function useSalesboxChatMessages(chatId?: string | null) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["salesbox-chat-messages", accountId, chatId],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/salesbox_chat_messages?account_id=${accountId}&chat_id=${chatId}&_sort=created_at&_order=asc&_limit=200`
      ).then((r) => r.data),
    enabled: !!accountId && !!chatId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useSalesboxMarkChatRead() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) =>
      apiPut(`/api/data/salesbox_chats/${data.pk_id}`, {
        account_id: accountId,
        status: "read",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesbox-chats"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useSalesboxSendMessage() {
  const accountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: any) =>
      apiPost(`/api/data/salesbox_chat_messages`, {
        account_id: accountId,
        chat_id: data.chatId,
        direction: "outbound",
        message_text: data.message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salesbox-chat-messages"] });
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
  };
}

export function useSalesboxChats(params?: any) {
  const accountId = useAuthStore((s) => s.accountId);

  const query = useQuery({
    queryKey: ["salesbox-chats", accountId, params],
    queryFn: () =>
      apiGet<{ data: any[] }>(
        `/api/data/salesbox_chats?account_id=${accountId}&_sort=updated_at&_order=desc&_limit=100`
      ).then((r) => r.data),
    enabled: !!accountId,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}

export default useSalesboxChats;
