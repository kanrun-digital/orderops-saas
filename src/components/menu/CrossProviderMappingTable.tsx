"use client";
import React from "react";

interface CrossProviderMappingTableProps {
  className?: string;
  [key: string]: unknown;
}

export function CrossProviderMappingTable({ className, ...props }: CrossProviderMappingTableProps) {
  return (
    <div className={className} data-component="CrossProviderMappingTable" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CrossProviderMappingTable]</p>
    </div>
  );
}

export default CrossProviderMappingTable;
