"use client";
import React from "react";

interface SyncRunDetailPanelProps {
  className?: string;
  [key: string]: unknown;
}

export function SyncRunDetailPanel({ className, ...props }: SyncRunDetailPanelProps) {
  return (
    <div className={className} data-component="SyncRunDetailPanel" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SyncRunDetailPanel]</p>
    </div>
  );
}

export default SyncRunDetailPanel;
