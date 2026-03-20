"use client";
import React from "react";

interface SendPushDialogProps {
  className?: string;
  [key: string]: unknown;
}

export function SendPushDialog({ className, ...props }: SendPushDialogProps) {
  return (
    <div className={className} data-component="SendPushDialog" {...props}>
      <p className="text-sm text-muted-foreground p-4">[SendPushDialog]</p>
    </div>
  );
}

export default SendPushDialog;
