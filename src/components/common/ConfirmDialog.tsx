"use client";
import React from "react";

interface ConfirmDialogProps {
  className?: string;
  [key: string]: unknown;
}

export function ConfirmDialog({ className, ...props }: ConfirmDialogProps) {
  return (
    <div className={className} data-component="ConfirmDialog" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ConfirmDialog]</p>
    </div>
  );
}

export default ConfirmDialog;
