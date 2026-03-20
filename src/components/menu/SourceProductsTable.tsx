"use client";
import React from "react";

interface SourceProductsTableProps {
  className?: string;
  [key: string]: unknown;
}

export function SourceProductsTable({ className, ...props }: SourceProductsTableProps) {
  return (
    <div className={className} data-component="SourceProductsTable" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SourceProductsTable]</p>
    </div>
  );
}

export default SourceProductsTable;

export interface SourceProduct {
  id: string;
  external_id: string;
  name: string;
  provider: string;
  price?: number;
}
