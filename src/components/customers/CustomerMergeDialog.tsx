"use client";
import React from "react";

interface CustomerMergeDialogProps {
  className?: string;
  [key: string]: unknown;
}

export function CustomerMergeDialog({ className, ...props }: CustomerMergeDialogProps) {
  return (
    <div className={className} data-component="CustomerMergeDialog" {...props}>
      <p className="text-sm text-muted-foreground p-4">[CustomerMergeDialog]</p>
    </div>
  );
}

export default CustomerMergeDialog;
