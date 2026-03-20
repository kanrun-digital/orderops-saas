"use client";
import React from "react";

interface CustomerMatchHistoryProps {
  className?: string;
  [key: string]: unknown;
}

export function CustomerMatchHistory({ className, ...props }: CustomerMatchHistoryProps) {
  return (
    <div className={className} data-component="CustomerMatchHistory" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CustomerMatchHistory]</p>
    </div>
  );
}

export default CustomerMatchHistory;
