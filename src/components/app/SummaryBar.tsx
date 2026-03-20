"use client";
import React from "react";

interface SummaryBarProps {
  className?: string;
  [key: string]: unknown;
}

export function SummaryBar({ className, ...props }: SummaryBarProps) {
  return (
    <div className={className} data-component="SummaryBar" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SummaryBar]</p>
    </div>
  );
}

export default SummaryBar;
