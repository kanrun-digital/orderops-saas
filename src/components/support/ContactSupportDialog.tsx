"use client";
import React from "react";

interface ContactSupportDialogProps {
  className?: string;
  [key: string]: unknown;
}

export function ContactSupportDialog({ className, ...props }: ContactSupportDialogProps) {
  return (
    <div className={className} data-component="ContactSupportDialog" {...props}>
      <p className="text-sm text-muted-foreground p-4">[ContactSupportDialog]</p>
    </div>
  );
}

export default ContactSupportDialog;
