"use client";
import React from "react";

interface BitrixProductsDiffPanelProps {
  className?: string;
  [key: string]: unknown;
}

export function BitrixProductsDiffPanel({ className, ...props }: BitrixProductsDiffPanelProps) {
  return (
    <div className={className} data-component="BitrixProductsDiffPanel" {...props}>
      <p className="text-sm text-muted-foreground p-4">[BitrixProductsDiffPanel]</p>
    </div>
  );
}

export default BitrixProductsDiffPanel;
