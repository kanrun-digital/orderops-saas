"use client";
import React from "react";

interface DataToolbarProps {
  className?: string;
  [key: string]: unknown;
}

export function DataToolbar({ className, ...props }: DataToolbarProps) {
  return (
    <div className={className} data-component="DataToolbar" {...props}>
      <p className="text-sm text-muted-foreground p-4">[DataToolbar]</p>
    </div>
  );
}

export default DataToolbar;
