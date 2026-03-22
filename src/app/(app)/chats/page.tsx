"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/app/PageHeader";
import { ChatList } from "@/components/chats/ChatList";
import { ChatConversation } from "@/components/chats/ChatConversation";
import {
  useSalesboxChats,
  useSalesboxChatMessages,
  useSalesboxMarkChatRead,
} from "@/hooks/useSalesboxChats";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const t = (key: string) => key;

export default function ChatsPage() {
  const searchParams = useSearchParams();
  const customerParam = searchParams.get("customer");
  const [statusFilter, setStatusFilter] = useState<"active" | "archived">("active");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const currentAccountId = useAuthStore((s) => s.accountId);
  const queryClient = useQueryClient();

  const { data: chats = [], isLoading: chatsLoading } = useSalesboxChats(statusFilter);
  const { data: messages = [], isLoading: messagesLoading } =
    useSalesboxChatMessages(selectedChatId);
  const markRead = useSalesboxMarkChatRead();

  const selectedChat =
    (chats as any[]).find((c: any) => c.id === selectedChatId) ?? null;

  // Auto-select chat: prioritise customer query param, then first chat
  useEffect(() => {
    if ((chats as any[]).length === 0) {
      setSelectedChatId(null);
      return;
    }
    if (customerParam) {
      const match = (chats as any[]).find(
        (c: any) => c.salesbox_user_id === customerParam
      );
      if (match) {
        setSelectedChatId(match.id);
        return;
      }
      toast.info(t("chats.customerNotFound"));
    }
    const exists = (chats as any[]).some((c: any) => c.id === selectedChatId);
    if (!exists) {
      setSelectedChatId((chats as any[])[0].id);
    }
  }, [chats, customerParam, statusFilter]);

  // Mark as read when selecting
  useEffect(() => {
    if (
      selectedChatId &&
      selectedChat &&
      selectedChat.unread_count > 0 &&
      !markRead.isPending
    ) {
      markRead.mutate({ chatId: selectedChatId });
    }
  }, [selectedChatId, selectedChat?.unread_count]);

  // Periodically refresh chats and messages to keep the conversation list up to date
  useEffect(() => {
    if (!currentAccountId) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["salesbox-chats"] });
      queryClient.invalidateQueries({ queryKey: ["salesbox-chat-messages"] });
    }, 10000);
    return () => clearInterval(interval);
  }, [currentAccountId, queryClient]);

  return (
    <div className="space-y-6">
      <PageHeader title={t("chats.title")} subtitle={t("chats.subtitle")} />
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        <ChatList
          chats={chats}
          isLoading={chatsLoading}
          selectedChatId={selectedChatId}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onSelectChat={setSelectedChatId}
        />
        <ChatConversation
          chat={selectedChat}
          messages={messages}
          isLoading={messagesLoading}
        />
      </div>
    </div>
  );
}
