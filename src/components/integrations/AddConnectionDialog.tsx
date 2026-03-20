"use client";
import React from "react";

interface AddConnectionDialogProps {
  className?: string;
  [key: string]: unknown;
}

export function AddConnectionDialog({ className, ...props }: AddConnectionDialogProps) {
  return (
    <div className={className} data-component="AddConnectionDialog" {...props}>
      <p className="text-sm text-muted-foreground p-4">[AddConnectionDialog]</p>
    </div>
  );
}

export default AddConnectionDialog;
