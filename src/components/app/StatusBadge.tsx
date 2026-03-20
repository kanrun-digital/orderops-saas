"use client";
import React from "react";

interface StatusBadgeProps {
  className?: string;
  [key: string]: unknown;
}

export function StatusBadge({ className, ...props }: StatusBadgeProps) {
  return (
    <div className={className} data-component="StatusBadge" {...props}>
      <p className="text-sm text-muted-foreground p-4">[StatusBadge]</p>
    </div>
  );
}

export default StatusBadge;
