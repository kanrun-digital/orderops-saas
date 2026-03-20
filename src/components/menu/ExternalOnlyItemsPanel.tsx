"use client";
import React from "react";

interface ExternalOnlyItemsPanelProps {
  className?: string;
  [key: string]: unknown;
}

export function ExternalOnlyItemsPanel({ className, ...props }: ExternalOnlyItemsPanelProps) {
  return (
    <div className={className} data-component="ExternalOnlyItemsPanel" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ExternalOnlyItemsPanel]</p>
    </div>
  );
}

export default ExternalOnlyItemsPanel;
