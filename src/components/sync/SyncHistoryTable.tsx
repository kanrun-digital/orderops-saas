"use client";
import React from "react";

interface SyncHistoryTableProps {
  className?: string;
  [key: string]: unknown;
}

export function SyncHistoryTable({ className, ...props }: SyncHistoryTableProps) {
  return (
    <div className={className} data-component="SyncHistoryTable" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SyncHistoryTable]</p>
    </div>
  );
}

export default SyncHistoryTable;
