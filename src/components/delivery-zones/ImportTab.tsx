"use client";
import React from "react";

interface ImportTabProps {
  className?: string;
  [key: string]: unknown;
}

export function ImportTab({ className, ...props }: ImportTabProps) {
  return (
    <div className={className} data-component="ImportTab" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ImportTab]</p>
    </div>
  );
}

export default ImportTab;
