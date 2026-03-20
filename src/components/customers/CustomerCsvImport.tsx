"use client";
import React from "react";

interface CustomerCsvImportProps {
  className?: string;
  [key: string]: unknown;
}

export function CustomerCsvImport({ className, ...props }: CustomerCsvImportProps) {
  return (
    <div className={className} data-component="CustomerCsvImport" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CustomerCsvImport]</p>
    </div>
  );
}

export default CustomerCsvImport;
