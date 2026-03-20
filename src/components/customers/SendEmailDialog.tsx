"use client";
import React from "react";

interface SendEmailDialogProps {
  className?: string;
  [key: string]: unknown;
}

export function SendEmailDialog({ className, ...props }: SendEmailDialogProps) {
  return (
    <div className={className} data-component="SendEmailDialog" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SendEmailDialog]</p>
    </div>
  );
}

export default SendEmailDialog;
