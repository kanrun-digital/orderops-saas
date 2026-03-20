"use client";
import React from "react";

interface CustomerSyncStateCardProps {
  className?: string;
  [key: string]: unknown;
}

export function CustomerSyncStateCard({ className, ...props }: CustomerSyncStateCardProps) {
  return (
    <div className={className} data-component="CustomerSyncStateCard" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CustomerSyncStateCard]</p>
    </div>
  );
}

export default CustomerSyncStateCard;
