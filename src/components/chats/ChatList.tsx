"use client";
import React from "react";

interface ChatListProps {
  className?: string;
  [key: string]: unknown;
}

export function ChatList({ className, ...props }: ChatListProps) {
  return (
    <div className={className} data-component="ChatList" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ChatList]</p>
    </div>
  );
}

export default ChatList;
