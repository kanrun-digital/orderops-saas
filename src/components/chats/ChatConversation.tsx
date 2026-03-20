"use client";
import React from "react";

interface ChatConversationProps {
  className?: string;
  [key: string]: unknown;
}

export function ChatConversation({ className, ...props }: ChatConversationProps) {
  return (
    <div className={className} data-component="ChatConversation" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ChatConversation]</p>
    </div>
  );
}

export default ChatConversation;
